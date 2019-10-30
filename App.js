import React, { Component } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  Button,
  TouchableOpacity,
} from 'react-native';

import AntDesignIcon from 'react-native-vector-icons/AntDesign';
import MaterialCommunityIconsIcon from 'react-native-vector-icons/MaterialCommunityIcons';

export default class App extends Component {

  state = {
    military_time: '',
    time: '',
    disp_time: '',
    disp_time_type: true, // true is AM/PM false is military
    temp: 0,
    pres: 0,
    humi: 0,
    temp_units: '°C',
    pres_units: 'kPa',
    humi_units: '%',
    n_decimal: 2,
  };

  RoundToNthPlace=(x,n)=>{
    return Math.round(x*(10**n))/(10**n);
  }

  ToggleTimeStyle=()=>{
    if(this.state.disp_time_type==true){
      this.setState({disp_time:this.state.military_time, disp_time_type:false});
    } else if(this.state.disp_time_type==false){
      this.setState({disp_time:this.state.time, disp_time_type: true});
    } else {
      console.error("Time is broken!", this.state.time);
      this.setState({disp_time:this.state.time, disp_time_type: true});
    }
  }

  ToggleTempUnits=()=>{
    if(this.state.temp_units=='°C'){
      this.setState({temp:((this.state.temp*9/5)+32), temp_units:'°F'});
    } else if(this.state.temp_units=='°F'){
      this.setState({temp:((this.state.temp-32)*5/9), temp_units:'°C'});
    } else {
      console.error("Temp units is broken:",this.state.temp_units);
      this.setState({temp:((this.state.temp-32)*5/9), temp_units:'°C'});
    }
    console.log(this.state.temp_units);
  }

  TogglePresUnits=()=>{
    if(this.state.pres_units=='kPa'){
      this.setState({pres:this.state.pres*0.1450377, pres_units:'psi'});
    } else if(this.state.pres_units=='psi'){
      this.setState({pres:this.state.pres/0.1450377, pres_units:'kPa'});
    } else {
      console.error("Pressure units is broken:",this.state.pres_units);
      this.setState({pres:this.state.pres/0.1450377, pres_units:'kPa'});
    }
    console.log(this.state.pres_units);
  }

  UnixTimeToDateTime=(unix_time)=>{
    var date = new Date(unix_time*1000);
    var full_hours = date.getHours();
    var hours = full_hours%12;
    var AM_PM = '';

    if(full_hours > 12){
      AM_PM = 'PM';
    } else {
      AM_PM = 'AM';
    }
    var minutes = "0" + date.getMinutes();
    var seconds = "0" + date.getSeconds();
    var military_time = full_hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
    var time = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2) + ' ' + AM_PM;

    if(this.state.disp_time_type==true){
      this.setState({military_time: military_time, time: time, disp_time: time});
    } else {
      this.setState({military_time: military_time, time: time, disp_time: military_time});
    }
  }

  PiAtmApiFetch=()=>{
    return fetch('http://10.0.0.66:8000/')
      .then((response) => response.json())
      .then((responseJson) => {

        var time =  responseJson.time;
        this.UnixTimeToDateTime(time);

        var temp_avg = (responseJson.temp[0]+responseJson.temp[1]+responseJson.temp[2])/3;
        if(this.state.temp_units=='°F'){
          temp_avg=temp_avg*9/5+32;
        }

        var pressure = responseJson.pressure/100;
        if(this.state.pres_units=='psi'){
          pressure=pressure*0.1450377;
        }
        var humidity = responseJson.humidity;

        var imp_temp_avg = (temp_avg * 9/5) + 32;
        var imp_pressure = responseJson.pressure*0.00015;

        this.setState({
          temp: temp_avg,
          pres: pressure,
          humi: humidity,
        });

        return responseJson;
      })
      .catch((error) => {
        console.error(error);
      });
  }


  componentDidMount(){
    this.PiAtmApiFetch();
  }

  render(){
    return (
      <>

      <View style={{ flex: 1, padding: 30, justifyContent: "center", alignItems: "center", backgroundColor:'black'}}>
        <View style={styles.circle}>
          <MaterialCommunityIconsIcon name="garage" size={100} color='white'/>
        </View>
      </View>

      <View style={{ flex: 1, flexDirection: 'row' }}>

        <View style={{ flex: 2, flexDirection: 'column', justifyContent: "center", alignItems: "flex-end", backgroundColor:'black' }}>

          <View style={{ flex: 1 }}>
            <TouchableOpacity style={{ padding:10 }} onPress={this.ToggleTimeStyle}>
              <Text style={styles.measurements_text}> {this.state.disp_time} </Text>
            </TouchableOpacity>
          </View>

          <View style={{ flex: 1 }}>
            <TouchableOpacity style={{ padding:10 }} onPress={this.ToggleTempUnits}>
              <Text style={styles.measurements_text}> {this.RoundToNthPlace(this.state.temp,this.state.n_decimal)} </Text>
            </TouchableOpacity>
          </View>

          <View style={{ flex: 1,}}>
            <TouchableOpacity style={{ padding:10 }} onPress={this.TogglePresUnits}>
              <Text style={styles.measurements_text}> {this.RoundToNthPlace(this.state.pres,this.state.n_decimal)} </Text>
            </TouchableOpacity>
          </View>

          <View style={{ flex: 1,}}>
            <View style={{ padding:10 }}>
              <Text style={styles.measurements_text}> {this.RoundToNthPlace(this.state.humi,this.state.n_decimal)} </Text>
            </View>
          </View>
        </View>

        <View style={{ flex: 1, justifyContent: "center", alignItems: "flex-start", backgroundColor:'black' }}>
          <View style={{ flex: 1 }}>
            <TouchableOpacity style={{ padding:10 }} onPress={this.ToggleTimeStyle}>
              <Text style={styles.units_text}> Time </Text>
            </TouchableOpacity>
          </View>

          <View style={{ flex: 1 }}>
            <TouchableOpacity style={{ padding:10 }} onPress={this.ToggleTempUnits}>
              <Text style={styles.units_text}> {this.state.temp_units} </Text>
            </TouchableOpacity>
          </View>

          <View style={{ flex: 1 }}>
            <TouchableOpacity style={{ padding:10 }} onPress={this.TogglePresUnits}>
              <Text style={styles.units_text}> {this.state.pres_units} </Text>
            </TouchableOpacity>
          </View>

          <View style={{ flex: 1 }}>
            <View style={{ padding:10 }}>
              <Text style={styles.units_text}> {this.state.humi_units} </Text>
            </View>
          </View>
        </View>

      </View>

      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor:'black'}}>
        <TouchableOpacity onPress={this.PiAtmApiFetch} style={styles.circle_button} >
        <AntDesignIcon name="cloudo" size={60} color='white'/>
        </TouchableOpacity>
      </View>
      </>

    );
  }
};

const styles = StyleSheet.create({
  circle:{
    borderWidth:1,
    borderColor:'rgba(0,0,0,0.2)',
    alignItems:'center',
    justifyContent:'center',
    width:200,
    height:200,
    backgroundColor:'#423e3f',
    borderRadius:100,
    justifyContent:"center",
    alignItems:"center",
  },

  circle_button:{
    borderWidth:1,
    borderColor:'rgba(0,0,0,0.2)',
    alignItems:'center',
    justifyContent:'center',
    width:100,
    height:100,
    backgroundColor:'#ff7373',
    borderRadius:50,
  },
  
  measurements_text:{
    fontFamily: 'HelveticaNeue-Thin',
    fontSize: 32,
    color:'white',
  },

  units_text:{
    fontFamily: 'HelveticaNeue',
    fontSize: 32,
    color:'white',
  },

});
