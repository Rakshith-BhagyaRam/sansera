import React, { useEffect, useState } from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView, Text, Alert, ActivityIndicator } from 'react-native';
import { ApiService } from "../httpservice";
import { util } from '../commons';
import UserContext from "./UserContext";
import { useIsFocused } from "@react-navigation/native";
import { SvgCss } from 'react-native-svg';
import { HexaStageSingle } from "../svgs/HexaStage"
import { appTheme } from '../lib/Themes';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { stageColors, stageType } from '../constants/appConstants';
import AppContext from '../context/AppContext';
import BilletHome from './billet/BilletHome';
import { ForgingHome } from './forging/ForgingHome';
import { ShearingHome } from './shearing/ShearingHome';
import { StageHome } from './generic/StageHome';
import { DispatchHome } from './dispatch/DispatchHome';

const styles = StyleSheet.create({

  item: {
    fontSize: 16,
    textAlign: 'center',
    fontFamily: appTheme.fonts.semiBold,
    color: appTheme.colors.stageTitle
  },

  countTxt: {
    fontSize: 14,
    fontFamily: appTheme.fonts.semiBold,
    color: appTheme.colors.stageTitle
  },

  container: {
    margin: 10,
    flex:1,
    justifyContent: 'center',
    backgroundColor:'white'
  },
  stageContainer: {

    //display: 'flex', 
    // flexDirection: 'column', 
    //marginLeft: 3,
    //paddingLeft:3
  },
  outStageContainer: {
    display: 'flex',
    flexDirection: 'column',
    //marginRight: 3,
    paddingRight: 3
  }
});


const  ProcessStages = (props) => {
  const isFocusedHistory = useIsFocused();
  let [user, setUser] = React.useState({})
  const [stagingData, setStagingData] = React.useState([])
  const [refreshing, setRefreshing] = useState(false)
  const userState = React.useContext(UserContext);
  const [stage, setStage] = useState('')
  const [apiStatus,setApiStatus] = useState(false);
  const {processStage, setProcessStage,userEntity} = React.useContext(AppContext)
  let interval;
   useEffect(() => {
    if (isFocusedHistory) {
      if (userState && userState.user)
        setUser(userState.user)
      if (processStage && processStage.toLowerCase().length) {
        setStage(processStage.toLowerCase())
      }
      else {
        getStagingProcess();
      }
    }
   
    return () => {
    };
  }, [isFocusedHistory])

  

  const getStagingProcess =  () => {
    let apiData = {      
      "op": "get_stages",
      "type": "Steel",
      "unit_num": userState.user.unit_number

    }
    setApiStatus(true);
    ApiService.getAPIRes(apiData, "POST", "process").then(apiRes => {
      setApiStatus(false)
      if (apiRes) {
        if (apiRes.status) {
          let stages = [...apiRes.response.message.stages]
          if (apiRes.response.message.stages && apiRes.response.message.stages.length) {
            setStagingData(apiRes.response.message.stages)
          }
        }
      }
      else if (apiRes.response.message)
        Alert.alert(apiRes.response.message)
    })

   
  }

  const stageNavigation = (stage) => {
    let validStages = ["shearing", "forging", "shot blasting", "visual","mpi", "shot peening","oiling",
    "billet punching","dispatch"];
    if (validStages.includes(stage.toLowerCase())) {
      setStage(stage.toLowerCase())
      AsyncStorage.setItem("stage", stage)
      setProcessStage(stage);
      

    }
    else {
      Alert.alert("Access Denied")
    }
  }

  return (
    <>
      {processStage && processStage.toLowerCase() === stageType.shearing ? <ShearingHome stage={stage}/> : false}
      {processStage && processStage.toLowerCase() === stageType.forging ? <ForgingHome stage={stage} /> : false}
      {processStage && (processStage.toLowerCase() === stageType.shotblasting || 
      processStage.toLowerCase() === stageType.visual  ||processStage.toLowerCase() === stageType.mpi || processStage.toLowerCase() === stageType.shotpeening || 
        processStage.toLowerCase() === stageType.oiling ) ? <StageHome stage={stage} /> : false}

        {processStage && processStage.toLowerCase() === stageType.dispatch ? <DispatchHome stage={stage}/> : false}
      {processStage && processStage.toLowerCase() === stageType.billetpunching ? <BilletHome stage={stage} /> : false}

      {processStage == null ? 
          <View style={styles.container}>
            {apiStatus ? <ActivityIndicator size="large" animating={apiStatus} /> : false}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', }}>
              {stagingData.map((item, index) => {
                if(item.toLowerCase() != stageType.underheat && item.toLowerCase() != stageType.rework){

                
                let color1 = stageColors[item.toLowerCase()] ? stageColors[item.toLowerCase()].color1 : appTheme.colors.gradientColor1;
                let color2 = stageColors[item.toLowerCase()] ? stageColors[item.toLowerCase()].color2 : appTheme.colors.gradientColor2
                return (
                  <TouchableOpacity style={styles.stageContainer} key={index}
                    onPress={() => stageNavigation(item)}>
                    <SvgCss
                      xml={HexaStageSingle(util.capitalizeWord(item),color1,color2)}
                      width={250} height={200} style={{justifyContent:'center'}}
                      />
                  </TouchableOpacity>
                )}
              })}
            </View></View> : false}      
    </>
  );
}
export default ProcessStages;

