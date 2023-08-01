import React, { useState, useEffect, useRef } from "react";

import { Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { appTheme } from '../../lib/Themes';
import ProcessFilter from '../process/ProcessFilter';
import WorkPlan from './WorkPlan';
import BinMqtt from "../mqtt/BinMqtt";
import TaskHome from "../tasks/TaskHome";
import { Rejection } from "../generic/Rejection";
import { EmptyBinContext } from "../../context/EmptyBinContext";
import { FifoBoard } from "../process/FifoBoard";
// import { MP3Home } from "../mp3/MP3Home";

const Tab = createMaterialTopTabNavigator();


export default function BilletHome() {
  const processRef = useRef()
  const [processDet, setProcessDet] = React.useState({});
  let { appProcess } = React.useContext(EmptyBinContext);
  const [route, setRoute] = React.useState('')

  const setProcess = (data) => {
   // setProcessDet(data)
  }

  const updateProcess = e => {
    processRef.current.setFromOutside(appProcess.process_name)
  }

  const TabNavigation = () => {

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
            tabPress: (e) => { setRoute('Work Plan') },
          }}
           />
        <Tab.Screen name="Rejection"
          children={() => <Rejection updateProcess={updateProcess} />}
          listeners={{
            tabPress: (e) => { setRoute('Rejection') },
          }}
        />
        <Tab.Screen name="Tasks"
          children={() => <TaskHome updateProcess={updateProcess} />}
          listeners={{
            tabPress: (e) => { setRoute('Tasks') },
          }}
        />
        {/* <Tab.Screen name="MP3"
          children={() => <MP3Home updateProcess={updateProcess} />}
          listeners={{
            tabPress: (e) => { setRoute('MP3') },
          }}
        /> */}
        
        <Tab.Screen name="FIFO Board"
          children={() => <FifoBoard />}
          listeners={{
            tabPress: (e) => { setRoute('FIFO Board') },
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>)
  }
  return (
    <View style={{ flex: 1, flexDirection: 'column' }}>
      <BinMqtt />
      <ProcessFilter processEntity={setProcess} ref={processRef} style={{ margin: 5 }} />
      <TabNavigation style={{ flex: 2 }} />
    </View>
  );
}
