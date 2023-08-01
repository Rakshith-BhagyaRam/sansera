import React, { useState, useEffect, useRef,memo } from "react";

import { Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { appTheme } from '../../lib/Themes';
import ProcessFilter from '../process/ProcessFilter';
import BinMqtt from "../mqtt/BinMqtt";
import { EmptyBinContext } from "../../context/EmptyBinContext";
import TaskHome from "../tasks/TaskHome";
import { WorkPlan } from "./WorkPlan";
import { Rejection } from "./Rejection";
import { FifoBoard } from "../process/FifoBoard";


const Tab = createMaterialTopTabNavigator();

export const ForgingHome = React.memo((props) => {

  const processRef = useRef()
  const [processDet, setProcessDet] = React.useState({});
  const [route, setRoute] = React.useState('')
  let { appProcess } = React.useContext(EmptyBinContext);

  const setProcess = (data) => {
    //setProcessDet(data)
  }

  const updateProcess = e => {
    processRef.current.setFromOutside(appProcess.process_name)
  }

  const TabNavigation = memo(() => {
    const { unReadTask } = React.useContext(EmptyBinContext)
    console.log("route here "+route);

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
          children={() => <WorkPlan
            //processEntity={processDet}
            //setProcessEntity={setProcess}
            updateProcess={updateProcess}
          />}
          listeners={{
            tabPress: (e) => {
              setRoute('Work Plan')
            },
          }}

          />
        <Tab.Screen name="Rejection"
          children={() => <Rejection
            //processEntity={processDet}
            //setProcessEntity={setProcess}
            updateProcess={updateProcess}

          />}
          listeners={{
            tabPress: (e) => {
              setRoute('Rejection')
            },
          }}
         
        />
        <Tab.Screen 
          name="Tasks"
          children={() => <TaskHome
           // processEntity={processDet}
            //setProcessEntity={setProcess}
            updateProcess={updateProcess}
          />}
          listeners={{
            tabPress: (e) => {
              setRoute('Tasks')
            },
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
    <View style={{ flex: 1, flexDirection: 'column' }}>
      <BinMqtt />
      <ProcessFilter processEntity={setProcess} ref={processRef} style={{ margin: 5 }} />
      <TabNavigation style={{ flex: 2 }} />

    </View>
  );
})
