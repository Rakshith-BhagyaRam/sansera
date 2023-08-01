import React, { useEffect, useState } from "react";
import { StyleSheet, Text, Alert,View } from "react-native";
import { title } from "../constants/appConstants";
import { appTheme } from "../lib/Themes";
import { useIsFocused } from '@react-navigation/native';
import { util } from "../commons";

const ErrorModal = (props) => {
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      loadData()
    }
    return () => { }
  }, [isFocused,props.msg])

  const okAction = () => {
    props.okAction();
  }

  const loadData = () => {
    if(props.msg && props.msg.split(":")[1]){
      let k = props.msg.split(":")[1].toString();
      const msg = util.capitalize(k.replace(/-/g, " "))
      let alertMsg = props.type && props.type === "info" ? msg : "Error : " + msg
      Alert.alert(alertMsg,"",[{text:"OK",onPress:(e) => okAction(e)}]);
    }
    else{
      let alertMsg = props.type && props.type === "info" ? props.msg : "Error : " + props.msg
      Alert.alert(alertMsg, "", [{ text: "OK", onPress: (e) => okAction(e) }]);
    }

  }
  return (
    <View>
    </View>
  )
};

const styles = StyleSheet.create({
  title: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: "bold",
    color: appTheme.colors.cardTitle,
    fontFamily: appTheme.fonts.bold,
    backgroundColor: 'white',
  },
});

export default ErrorModal;