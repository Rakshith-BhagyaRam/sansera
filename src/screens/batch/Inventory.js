import React, { useState, useEffect } from "react";
import {StyleSheet, Text, View,  TouchableOpacity, ScrollView, RefreshControl} from "react-native";
import UserContext from "../UserContext";
import { useIsFocused } from '@react-navigation/native';
import { appTheme } from "../../lib/Themes";
import { EmptyBinContext } from "../../context/EmptyBinContext";
import ClearInventory from "./ClearInventory";
import { RackData } from "./RackData";


export default Inventory = React.memo((props) => {

  const [refreshing, setRefreshing] = useState(false)
  const isFocused = useIsFocused();
  const [tab, setTab] = useState('')

  useEffect(() => {
    if (isFocused) {
      if (tab === "") setTab('batchInventory')
    }
    return () => { }
  }, [isFocused])


  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
  }, []);


  const tabChange = (value) => {
    setTab(value)
  }
 

  return (
    <View style={{flexDirection:'column',flex:1}}>
      <View style={{ flexDirection: 'row', backgroundColor: 'white', padding: 10 }}>
        <TouchableOpacity style={{
          flexDirection: 'row', padding: 8,
          borderRadius: 15,
          backgroundColor: tab === "batchInventory" ? appTheme.colors.cardTitle : appTheme.colors.inactiveTab
        }}
          onPress={(e) => tabChange("batchInventory")} >
          <Text style={[styles.filterText, { fontFamily: appTheme.fonts.bold, color: tab === "batchInventory" ? 'white' : appTheme.colors.cardTitle, }]}>BATCH INVENTORY </Text>
        </TouchableOpacity>
        <Text style={{ padding: 8 }}> / </Text>
        <TouchableOpacity
          style={{
            flexDirection: 'row', padding: 8,
            borderRadius: 15,
            backgroundColor: tab === "rackData" ? appTheme.colors.cardTitle : appTheme.colors.inactiveTab
          }}
          onPress={(e) => tabChange("rackData")} >
          <Text style={[styles.filterText, { fontFamily: appTheme.fonts.bold, color: tab === "rackData" ? 'white' : appTheme.colors.cardTitle, }]}>RACK DATA </Text>
         
        </TouchableOpacity>

      </View>
      <View style={[styles.mainContainer,{flex:4}]}>
        {tab === "batchInventory" ? <ClearInventory/> : false}
        {tab === "rackData" ? <RackData /> : false}
      </View>
    </View>
  )
})

const styles = StyleSheet.create({
  mainContainer: {
    justifyContent: "center",
    margin: 10,
  },

});