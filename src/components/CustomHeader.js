import React, { useState } from "react";
import { StyleSheet, Text  } from "react-native";
import { title } from "../constants/appConstants";
import { appTheme } from "../lib/Themes";

const CustomHeader = (props) => {
  return (
    <Text style={[styles.title,
      {fontSize:props.size ? props.size : 20,
      textAlign:props.align ? props.align : title.textAlign
      }]}>{props.title}</Text>
  )
};

const styles = StyleSheet.create({
  title: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: "bold",
    color: appTheme.colors.cardTitle,
    fontFamily: appTheme.fonts.bold,
    backgroundColor:'white'
  },
});

export default CustomHeader;