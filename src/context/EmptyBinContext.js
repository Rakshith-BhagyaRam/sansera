import React, {Component, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const EmptyBinContext = React.createContext({});

const EmptyBinContextProvider = ({children}) => {
  const [unReadEmptyBin, setUnReadEmptyBin] = React.useState('0');
  const [unReadFilledBin, setUnReadFilledBin] = React.useState('0');
  const [unReadTask, setUnReadTask] = React.useState('0');
  const [lowBattery, setLowBattery] = React.useState([]);
  const [appProcess, setAppProcess] = React.useState({});

  useEffect(() => {
    AsyncStorage.getItem('emptyBinCount').then(data => {
      if (data) setUnReadEmptyBin(data);
    });
    AsyncStorage.getItem('filledBinCount').then(data => {
      if (data) setUnReadFilledBin(data);
    });
    AsyncStorage.getItem('taskCount').then(data => {
      if (data) setUnReadTask(data);
    });
    AsyncStorage.getItem('lowBattery').then(data => {
      if (data) setLowBatteryData(data);
    });
  }, []);

  const setUnReadEmptyBinData = value => {
    setUnReadEmptyBin(value);
    AsyncStorage.setItem('emptyBinCount', value);
    AsyncStorage.getItem('filledBinCount').then(value1 => {
      if (value1) {
        let taskC = parseInt(value1) + parseInt(value);
        setUnReadTask(taskC.toString());
        AsyncStorage.setItem('taskCount', taskC.toString());
      } else {
        setUnReadTask(value);
        AsyncStorage.setItem('taskCount', value.toString());
      }
    });
  };

  const setUnReadFilledBinData = value => {
    setUnReadFilledBin(value);
    AsyncStorage.setItem('filledBinCount', value);
    AsyncStorage.getItem('emptyBinCount').then(value1 => {
      if (value1) {
        let taskC = parseInt(value1) + parseInt(value);
        setUnReadTask(taskC.toString());
        AsyncStorage.setItem('taskCount', taskC.toString());
      } else {
        setUnReadTask(value.toString());
        AsyncStorage.setItem('taskCount', value.toString());
      }
    });
  };

  const resetTaskData = value => {
    setUnReadFilledBin(value);
    AsyncStorage.setItem('taskCount', value);
  };

  const setAppProcessData = value => {
    setAppProcess(value);
  };

  const setLowBatteryData = value => {
    let batteryData = [...lowBattery];
    batteryData.push(value);
    setLowBattery(batteryData);
  };

  return (
    <EmptyBinContext.Provider
      value={{
        unReadEmptyBin,
        setUnReadEmptyBinData,
        unReadFilledBin,
        setUnReadFilledBinData,
        unReadTask,
        resetTaskData,
        appProcess,
        setAppProcessData,
        lowBattery,
        setLowBattery,
      }}>
      {children}
    </EmptyBinContext.Provider>
  );
};

export {EmptyBinContext, EmptyBinContextProvider};
