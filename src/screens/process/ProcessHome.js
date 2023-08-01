import * as React from 'react';
import { Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import TopBar from '../TopBar';
import ProcessDetails from './ProcessDetails';
import { appTheme } from '../../lib/Themes';
import ProcessList from './ProcessList';
import ConsumptionFilters from '../generic/ConsumptionFilters';





const Tab = createMaterialTopTabNavigator();

export default function ProcessHome() {
  return (
    <>

      <NavigationContainer independent={true}>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarActiveTintColor: appTheme.colors.cardTitle,
            tabBarInactiveTintColor: 'gray',
            lazy: true
          })}
        >
         
          <Tab.Screen name="View Process" component={ProcessList}
            listeners={({ navigation, route }) => ({
              tabPress: e => {
                if (route.state && route.state.routeNames.length > 0) {
                  navigation.navigate('Edit Process')
                }
              },
            })} />
          <Tab.Screen name="Consumption Data" component={ConsumptionFilters}
            
          />
          <Tab.Screen name="Create Process" component={ProcessDetails}
            listeners={({ navigation, route }) => ({
              tabPress: e => {
                if (route.state && route.state.routeNames.length > 0) {
                  navigation.navigate('Create Process')
                }
              },
            })}
          />
         
         

        </Tab.Navigator>
      </NavigationContainer>
    </>
  );
}
