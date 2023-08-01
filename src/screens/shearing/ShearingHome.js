import React, { useState, useEffect,useRef,memo } from "react";

import { Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { appTheme } from '../../lib/Themes';
import ProcessFilter from '../process/ProcessFilter';
import WorkPlan from './WorkPlan';
import RawMaterial from './RawMaterial';
import BinMqtt from "../mqtt/BinMqtt";
import { useIsFocused } from '@react-navigation/native';
import TaskHome from "../tasks/TaskHome";
import { EmptyBinContext } from "../../context/EmptyBinContext";
import { FifoBoard } from "../process/FifoBoard";
import { ConsumptionData } from "../generic/ConsumptionData";

const Tab = createMaterialTopTabNavigator();


export const ShearingHome = React.memo((props) =>  {
  const processRef = useRef()
  const isFocused = useIsFocused();
  const [processDet, setProcessDet] = React.useState({});
  let { appProcess } = React.useContext(EmptyBinContext);
  const [route, setRoute] = React.useState('')
  useEffect(() => {
    if (isFocused) {
     
    }
    return () => { }
  }, [])

  const setProcess = (data) => {
    setProcessDet(data)
  }

  const updateProcess = e => {
    processRef.current.setFromOutside(appProcess.process_name)

    //processRef.current.setFromOutside('HELLO from Parent')
  }
  
  const TabNavigation = memo(() => {
    const { unReadTask } = React.useContext(EmptyBinContext)

    return (<NavigationContainer independent={true}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarActiveTintColor: appTheme.colors.cardTitle,
          tabBarInactiveTintColor: 'gray',
          lazy: true
        })}
        initialRouteName={route.length ? route : 'Work Plan'}
      >
        <Tab.Screen name="Work Plan"
          children={() => <WorkPlan updateProcess={updateProcess} />}
          listeners={{
            tabPress: (e) => {
              setRoute('Work Plan')
            },
          }}
        />

        <Tab.Screen name="Raw Material" 
          children={() => <RawMaterial 
            processEntity={processDet} setProcessEntity={setProcess} updateProcess={updateProcess} />}
          listeners={{
            tabPress: (e) => {
              setRoute('Raw Material')
            },
          }}
        />

        <Tab.Screen name="Consumption Data"
          children={() => <ConsumptionData />}
          listeners={{
            tabPress: (e) => {
              setRoute('Consumption Data')
            },
          }}
        />
        
        <Tab.Screen 
          name="Tasks"
          children={() => <TaskHome updateProcess={updateProcess} />}
          listeners={{ 
            tabPress: (e) => { setRoute('Tasks') }, 
          }}
        />

        <Tab.Screen
          name="FIFO Board"
          children={() => <FifoBoard />}
          listeners={{
            tabPress: (e) => {
              setRoute('FIFO Board')
            },
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>)
  })
  return (
    <View style={{flex:1,flexDirection:'column'}}>
      <BinMqtt />
      <ProcessFilter processEntity={setProcess} ref={processRef} style={{margin:5}}/>
      <TabNavigation style={{flex:2}}/>
      
    </View>
  );
})
