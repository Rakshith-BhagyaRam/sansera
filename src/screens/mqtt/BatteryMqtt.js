
import React, { useEffect, useState } from "react";
import UserContext from "../UserContext";
import MQTT from 'sp-react-native-mqtt';
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons"
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, RefreshControl, Alert, ActivityIndicator } from "react-native";
import { appTheme } from "../../lib/Themes";
import { ApiService } from "../../httpservice";
import { roles } from "../../constants/appConstants";
import { useIsFocused } from '@react-navigation/native';
import { binMqttOptions } from "../../constants/urlConstants";


const BatteryMqtt = (props) => {
  const userState = React.useContext(UserContext);
  const isFocused = useIsFocused();
  let [user, setUser] = React.useState({})
  const [binListeningEvent, setBinListeningEvent] = useState(false);
  const [binClient, setBinClient] = useState(undefined);

  useEffect(() => {
    if (isFocused) {
      if (userState && userState.user) setUser(userState.user);
      connectBinMQTT()
    }
    return () => {
    }
  }, [isFocused])

  const reconnectToBinMQTT = () => {
    connectBinMQTT();
  }

  const connectBinMQTT = () => {
    let options = { ...binMqttOptions }
    options.clientId = "binclientId" + Date.now()
    console.log(options);
    MQTT.createClient(options).then((client) => {
      setBinClient(client)
      client.connect();

      client.on('closed', () => {
        console.log('mqtt.event.closed');
        setBinListeningEvent(false);
      });

      client.on('error', (msg) => {
        console.log('bin mqtt.event.error', msg);
        setBinListeningEvent(false);
      });

      client.on('message', (msg) => {
        console.log('mqtt.event.message', msg);
        console.log("bin request : " + JSON.stringify(msg))
        let dataJson = JSON.parse(msg.data)
        let deviceId = dataJson.devID;
       
      });

      client.on('connect', () => {
        console.log('connected');
        setBinListeningEvent(true);
        client.subscribe('BAT_STS')
      });

      setBinClient(client)

    }).catch((err) => {
      console.log("bin switch err : " + err);
      setBinListeningEvent(false);
    });
  }

  const setUnReadEmptyBin = (count) => {
    setUnReadEmptyBinData(count.toString())
  }

  return (
    <div></div>
    )
}

export default React.memo(BatteryMqtt);
