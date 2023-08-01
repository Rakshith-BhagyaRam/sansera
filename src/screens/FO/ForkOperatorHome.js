import React from 'react';
import {StyleSheet, View} from 'react-native';
import {BinTask} from '../tasks/BinTask';
import BinMqtt from '../mqtt/BinMqtt';

const ForkOperatorHome = props => {
  return (
    <View style={styles.root}>
      <BinMqtt />
      <BinTask />
    </View>
  );
};

export default ForkOperatorHome;

const styles = StyleSheet.create({
  root: {flex: 1, flexDirection: 'column', padding: 5},
});
