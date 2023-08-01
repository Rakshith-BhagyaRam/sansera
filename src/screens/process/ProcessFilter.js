import React, {useState, useEffect, useContext} from 'react';
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import {appTheme} from '../../lib/Themes';
import {ApiService} from '../../httpservice';
import UserContext from '../UserContext';
import {useIsFocused} from '@react-navigation/native';
import {RadioButton} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {forwardRef, useImperativeHandle} from 'react';
import AppStyles from '../../styles/AppStyles';
import AppContext from '../../context/AppContext';
import {EmptyBinContext} from '../../context/EmptyBinContext';

function ProcessFilter(props, ref) {
  const userState = React.useContext(UserContext);
  const isFocused = useIsFocused();

  const [apiError, setApiError] = useState('');
  const [apiStatus, setApiStatus] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [process, setProcess] = useState([]);
  const [processName, setProcessName] = useState('');

  const {setAppProcessData} = React.useContext(EmptyBinContext);

  useEffect(() => {
    if (isFocused) {
      loadProcess();
    }
    return () => {};
  }, [isFocused]);

  useImperativeHandle(
    ref,
    () => ({
      setFromOutside(selectedProcess) {
        reload(selectedProcess);
      },
    }),
    [],
  );

  const loadProcess = selectedProcess => {
    setApiStatus(true);
    let apiData = {
      op: 'get_process',
      status: ['RUNNING'],
      unit_num: userState.user.unit_number,
    };

    setRefreshing(false);
    ApiService.getAPIRes(apiData, 'POST', 'process').then(apiRes => {
      setApiStatus(false);
      if (apiRes && apiRes.status) {
        if (apiRes.response.message && apiRes.response.message.length) {
          let currentProcess = apiRes.response.message[0];

          if (currentProcess) {
            if (selectedProcess && selectedProcess.length > 0) {
              let currentProObj = apiRes.response.message.find(
                item => item.process_name === selectedProcess,
              );
              // props.processEntity(currentProObj)
              setProcessName(currentProObj.process_name);
              setAppProcessData(currentProObj);
            } else {
              let processEntity = apiRes.response.message[0];
              // props.processEntity(processEntity)
              setProcessName(processEntity.process_name);
              setAppProcessData(processEntity);
            }
          }

          setProcess(apiRes.response.message);
        }
      } else {
        setProcess([]);
      }
    });
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadProcess();
  }, []);

  const handleChange = name => value => {
    let index = process.findIndex(item => item.process_name === value);
    setProcessName(value);

    if (index > -1) {
      // props.processEntity(process[index])
      setAppProcessData(process[index]);
    }
  };

  const reload = processName => {
    loadProcess(processName);
  };

  return (
    <View style={[styles.container, {}]}>
      {apiStatus ? (
        <ActivityIndicator size="large" animating={apiStatus} />
      ) : (
        false
      )}
      <View
        style={{
          flexDirection: 'row',
          margin: 2,
          padding: 5,
          backgroundColor: 'white',
        }}>
        <Text style={[AppStyles.filterLabel, {margin: 1}]}>Process</Text>
        <ScrollView horizontal={true}>
          <RadioButton.Group
            onValueChange={handleChange('process')}
            value={processName}
            style={{flexDirection: 'row'}}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                alignSelf: 'center',
              }}>
              {process.map((item, index) => {
                return (
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'center',
                      alignItems: 'center',
                      alignSelf: 'center',
                      margin: 1,
                      // backgroundColor:item.process_name === processName ? appTheme.colors.cardTitle : 'white',
                    }}
                    key={index}>
                    <RadioButton value={item.process_name} />
                    <Text
                      style={[
                        styles.radioText,
                        {
                          marginRight: 10,
                          color:
                            item.process_name === processName
                              ? appTheme.colors.cardTitle
                              : appTheme.colors.warnAction,
                          fontFamily: appTheme.fonts.bold,
                        },
                      ]}>
                      {item.process_name}
                    </Text>
                  </View>
                );
              })}
            </View>
          </RadioButton.Group>
        </ScrollView>
      </View>
    </View>
  );
}
export default React.forwardRef(ProcessFilter);
const styles = StyleSheet.create({
  container: {
    //margin: 5,
    // height:100,
    //flex:1
  },

  radioText: {
    fontSize: 16,
  },

  filterLabel: {
    fontSize: 14,
    fontFamily: appTheme.fonts.regular,
    padding: 5,
  },
});
