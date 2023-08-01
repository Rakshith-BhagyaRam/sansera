import React, { useState } from "react";
import { StyleSheet, Text,View } from "react-native";
import { grey100 } from "react-native-paper/lib/typescript/styles/colors";
import { appTheme } from "../lib/Themes";

const CustomCard = (props) => {
  return (
    <View style={styles.cardContainer}>
      <Text style={styles.title}>{props.title}</Text>
      <View style={{border:'1px solid red'}}></View>
      <View style={styles.cardAreaContainer}>
        {props.cardContent}


      </View>

    </View>
  )
};

const styles = StyleSheet.create({
  cardContainer:{
    justifyContent:'center',
    margin:5,
    //padding:5,
    borderColor: appTheme.colors.backAction,
    borderWidth:0.5,
    shadowColor: "#d9d9d9",
    shadowOpacity: 0.8,
    shadowRadius: 2,
    shadowOffset: {
      height: 1,
      width: 1
    }
  },
  title: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: "bold",
    color: appTheme.colors.cardTitle,
    fontFamily: appTheme.fonts.bold,
    backgroundColor:appTheme.colors.screenBackground,
    padding:5,
    borderBottomColor:'grey',
    borderBottomWidth:1
  },
  cardAreaContainer:{
    margin:5,
    padding:5
  }
});

export default CustomCard;