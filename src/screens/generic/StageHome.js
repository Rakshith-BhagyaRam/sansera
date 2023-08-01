import React, {  useEffect, useRef, memo } from "react";

import {  View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { appTheme } from '../../lib/Themes';
import ProcessFilter from '../process/ProcessFilter';
import BinMqtt from "../mqtt/BinMqtt";
import AppContext from "../../context/AppContext";
import { useIsFocused } from '@react-navigation/native';
import { Rejection } from "./Rejection"
import { WorkPlan } from "./WorkPlan"
import TaskHome from "../tasks/TaskHome";
import { EmptyBinContext } from "../../context/EmptyBinContext";
import { FifoBoard } from "../process/FifoBoard";

const Tab = createMaterialTopTabNavigator();



export const StageHome = React.memo((props) => {
  const isFocused = useIsFocused();
  const processRef = useRef()
  let { processStage } = React.useContext(AppContext);
  let { appProcess } = React.useContext(EmptyBinContext);
  const [route, setRoute] = React.useState('')
  useEffect(() => {
    if (isFocused) {
    }
    return () => { }
  }, [isFocused])


  const updateProcess = e => {
    console.log('call update')
    processRef.current.setFromOutside(appProcess.process_name)
  }

  const TabNavigation = memo(() => {
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
          listeners={{ tabPress: (e) => { setRoute('Work Plan') } }}
        />
        {(processStage.toLowerCase() !== "oiling" && processStage.toLowerCase() != "mpi" && processStage.toLowerCase() != "dispatch") ?
          <Tab.Screen name="Rejection"
            children={() => <Rejection updateProcess={updateProcess} />}
            listeners={{ tabPress: (e) => { setRoute('Rejection') }, }}
          /> : false}
        <Tab.Screen
          name="Tasks"
          children={() => <TaskHome updateProcess={updateProcess} />}
          listeners={{ tabPress: (e) => { setRoute('Tasks') }, }}
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
    <View style={{ flex: 1, flexDirection: 'column' }}>
      {console.log("stage home loaded")}
      <BinMqtt />
      <ProcessFilter
        //processEntity={setProcess} 
        ref={processRef} style={{ margin: 5 }} />
      <TabNavigation style={{ flex: 2 }} />
    </View>
  );
})
