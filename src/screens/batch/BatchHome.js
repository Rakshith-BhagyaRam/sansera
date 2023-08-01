import * as React from 'react';
import { Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import TopBar from '../TopBar';
import BatchDetails from './BatchDetails';
import LoadRM from './LoadRM';
import ApproveBatch from './ApproveBatch';
import { appTheme } from '../../lib/Themes';
import Inventory from './Inventory';
import { FifoBoard } from '../process/FifoBoard';
import { BatchBoard } from './BatchBoard';






const Tab = createMaterialTopTabNavigator();

export default function BatchHome() {
  return (
    <>
   
    <NavigationContainer independent={true}>
      <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarActiveTintColor: appTheme.colors.cardTitle,
            tabBarInactiveTintColor: 'gray',
            lazy:true
          })}
      >
        <Tab.Screen name="Create Batch" component={BatchDetails} 
            listeners={({ navigation, route }) => ({
              tabPress: e => {
                if (route.state && route.state.routeNames.length > 0) {
                  navigation.navigate('Create Batch')
                }
              },
            })}
        />
        <Tab.Screen name="Load Raw Material" component={LoadRM}
            listeners={({ navigation, route }) => ({
              tabPress: e => {
                if (route.state && route.state.routeNames.length > 0) {
                  navigation.navigate('Load Raw Material')
                }
              },
            })} />
        <Tab.Screen name="Approve Batch" component={ApproveBatch} 
        
           />
        <Tab.Screen name="Inventory" component={Inventory}
            listeners={({ navigation, route }) => ({
              tabPress: e => {
                if (route.state && route.state.routeNames.length > 0) {
                  navigation.navigate('Inventory')
                }
              },
            })} />
          <Tab.Screen name="FIFO Board" component={BatchBoard}
            listeners={({ navigation, route }) => ({
              tabPress: e => {
                if (route.state && route.state.routeNames.length > 0) {
                  navigation.navigate('FIFO Board')
                }
              },
            })} />

      </Tab.Navigator>
    </NavigationContainer>
    </>
  );
}
