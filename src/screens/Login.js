import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, Image, TextInput, TouchableOpacity, ImageBackground, ActivityIndicator, Alert } from "react-native";
import { util } from "../commons";
import { ApiService } from "../httpservice";
import AsyncStorage from '@react-native-async-storage/async-storage';
import UserContext from "./UserContext";
import { subscribeToTopic } from './notification/NotifyHandler';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { SvgCss } from "react-native-svg"
import { EmailIcon, PasswordIcon, TickIcon } from "../svgs/GenericIcon"
import { appTheme } from "../lib/Themes";
import TopBar from "./TopBar";
import Home from "./Home";
import AppContext from "../context/AppContext";

let loginSchema = [
  {
    "key": "emp_id", displayName: "", placeholder: "Your Employee ID", value: "", error: "", required: true, lowerCase: true, "label": "Employee ID",
    icon: <SvgCss xml={EmailIcon(appTheme.colors.cardTitle)} width={20} height={20} style={{ margin: 5 }} />
  },
  {
    "key": "password", displayName: "", placeholder: "Password", secureTextEntry: true, value: "", error: "",
    required: true, label: "password",
    icon: <SvgCss xml={PasswordIcon(appTheme.colors.cardTitle)} width={20} height={20} style={{ margin: 5 }} />
  },
]
export default function Login() {
  const [loginData, setLoginData] = useState([])
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState({})
  const [apiError, setApiError] = useState('')
  const [apiStatus, setApiStatus] = useState(false);
  const [binTopics, setBinTopics] = useState([])

  const { saveUser } = React.useContext(UserContext)
  const { setUserEntity } = React.useContext(AppContext)
  useEffect(() => {
    getUser().then(uExists => {
      if (uExists) setIsLoggedIn(true)
      if (!uExists) {
        loadForm()
      }
    });

    return () => { }
  }, [])

  const loadForm = async () => {
    let loginSchemaData = [...loginSchema];
    let loginForm = await util.formatForm(loginSchemaData);
    // loginForm[0].value = "emp222"
    //loginForm[1].value = "password"
    setLoginData(loginForm)
  }

  const handleChange = (name) => value => {
    let loginFormData = [...loginData]
    let index = loginFormData.findIndex(item => item.key === name);
    if (index != -1) {
      let updatedItem = loginFormData[index]
      updatedItem["value"] = value;
      let updatedLoginData = [...loginFormData.slice(0, index), updatedItem, ...loginFormData.slice(index + 1)];
      setLoginData([...updatedLoginData]);
    }
  };

  const setVisibility = (name) => {
    let loginFormData = [...loginData]
    let index = loginFormData.findIndex(item => item.key === name);
    if (index != -1) {
      let updatedItem = loginFormData[index]
      updatedItem.secureTextEntry = !updatedItem.secureTextEntry;
      let updatedLoginData = [...loginFormData.slice(0, index), updatedItem, ...loginFormData.slice(index + 1)];
      setLoginData([...updatedLoginData]);
    }
  };

  const handleSubmit = async () => {
    let loginFormData = [...loginData]
    let validFormData = await util.validateFormData(loginFormData);
    let isError = validFormData.find(item => {
      if (item.error.length) return item;
    });
    setLoginData(validFormData);
    if (!isError) {
      setApiStatus(true)
      let apiData = await util.filterFormData([...loginData]);
      apiData.op = "login"
      console.log("login data " + JSON.stringify(apiData))
      let apiRes = await ApiService.getAPIRes(apiData, "POST", "login")
      console.log("login response : " + JSON.stringify(apiRes));

      setApiStatus(false)
      if (!apiRes)
        setApiError("Please load again!")
      if (apiRes && apiRes.status) {
        if (apiRes.response.role === "QA") apiRes.response.roleName = "Quality Operator";
        AsyncStorage.setItem("userInfo", JSON.stringify(apiRes.response.message))
        AsyncStorage.setItem('token', apiRes.response.message.accessToken)
        let defaultLowBattery = [];
        AsyncStorage.setItem("lowBattery", JSON.stringify(defaultLowBattery));
        subscribeToTopic(apiRes.response.message.id);
        setUser(apiRes.response.message)
        saveUser(apiRes.response.message);
        setUserEntity(apiRes.response.message)
        setIsLoggedIn(true)

        let topicPaylaod = { op: "get_device", "unit_num": apiRes.response.message.unit_number }
        let topicRes = await ApiService.getAPIRes(topicPaylaod, "POST", "mqtt")

        if (topicRes.status) {
          console.log("topics : " + JSON.stringify(topicRes.response))
          let rackSwitch = []
          let binSwitch = []
          let devices = []
          let deviceDet = []
          let switchPressedRacks = topicRes.response.message.reduce(function (acc, obj) {
            // let key = obj["topic_name"]
            // if (key.includes("/get/switch")) {
            if (obj.type === 'rack') {
              rackSwitch.push(obj)
              acc.push(obj)
              devices.push(obj.device_id)
              deviceDet.push(obj)
            }
            else if (obj.type === "bin") {
              devices.push(obj.device_id)
              binSwitch.push(obj)
              deviceDet.push(obj)

            }
            // }
            return acc
          }, []);

          AsyncStorage.setItem("racks", JSON.stringify(switchPressedRacks));
          AsyncStorage.setItem("bins", JSON.stringify(binSwitch));
          AsyncStorage.setItem("devices", JSON.stringify(devices))
          AsyncStorage.setItem("deviceDet", JSON.stringify(deviceDet))

          setBinTopics(JSON.stringify(binSwitch))

          // let emptyBinReq = [
          //   { "topic_name": "MWPI2/2E-17-AE-3F", "element_id": "2E-17-AE-3F", "element_num": "B1" },
          //   { "topic_name": "MWPI2/8F-11-99-25", "element_id": "8F-11-99-25", "element_num": "B2" },
          // ]
          // AsyncStorage.setItem("emptyBinReq", JSON.stringify(emptyBinReq));

        }

      }
      else {
        if (apiRes && apiRes.response) setApiError(apiRes.response.message)
        Alert.alert(apiRes.response.message)
      }



    }
  }
  const getUser = async () => {
    let user = await AsyncStorage.getItem('userInfo')
    if (user) {
      setUser(JSON.parse(user))
      setIsLoggedIn(true)
      return true;
    } else {
      setIsLoggedIn(false)
      return false;
    }
  };

  return (
    <>
      {isLoggedIn ? <Home user={user} binTopics={binTopics} /> : (
        <View style={styles.loginContainer}>
          <Image source={require("../images/sansera.png")} style={{ alignSelf: 'center' }} />
          <ActivityIndicator size="large" animating={apiStatus} />

          {loginData.map((item, index) => {
            return (
              <View style={{ margin: 10, marginLeft: 20, marginRight: 20, }} key={index}>

                <View style={{ flexDirection: 'column', width: '50%', alignSelf: 'center' }}>

                  <View style={{
                    flexDirection: 'row',
                    borderBottomColor: '#1A237E',
                    borderBottomWidth: 1,
                    borderRadius: 10,
                  }} key={index}>
                    {item.icon ? item.icon : false}

                    <TextInput name={item.key}
                      style={[styles.TextInput, { opacity: (item.value && item.value.length) ? 1 : 0.6 }]}
                      placeholder={item.placeholder}
                      placeholderTextColor="grey"
                      onChangeText={handleChange(item.key)}
                      value={item.value}
                      secureTextEntry={item.secureTextEntry ? true : false} />
                    {item.secureTextEntry != undefined && item.value && item.value.length ?
                      <Icon
                        name={item.secureTextEntry ? 'eye-slash' : 'eye'}
                        size={20} color={appTheme.colors.cardTitle} onPress={(e) => setVisibility(item.key)}
                        style={{ justifyContent: 'center', alignItems: 'center', alignSelf: 'center', margin: 5, padding: 5 }}
                      /> : false}
                  </View>
                  {item.error && item.error.length ? (<Text style={{ color: 'red', fontSize: 12, marginLeft: 20, padding: 2 }}> {item.error} </Text>) : (false)}

                </View>
              </View>
            )
          })}

          {apiError && apiError.length ? (<Text style={{ color: 'red', fontSize: 12, padding: 2, margin: 10 }}> {apiError} </Text>) : (false)}
          <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
            <TouchableOpacity style={[styles.loginBtn, { flexDirection: 'row' }]} onPress={(e) => handleSubmit(e)} >
              <Text style={styles.loginText}>LOGIN</Text>
              <SvgCss xml={TickIcon('black')} width={15} height={15} style={{ marginLeft: 5 }} />

            </TouchableOpacity>

          </View>
        </View>


      )}

    </>
  )
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 10,
    padding: 10
  },
  loginContainer: {
    flex: 1,
    //marginTop:150,
    // backgroundColor: "#fff",
    justifyContent: "center",
  },
  image: {
    marginBottom: 40,
  },
  inputView: {
    //backgroundColor: "#ECF0FA",
    borderRadius: 30,
    width: "100%",
    margin: 20,
  },
  TextInput: {
    //width: "100%",
    height: 50,
    padding: 10,
    textAlign: 'left',
    fontSize: 14,
    flex: 1,
    color: 'black',
    fontFamily: appTheme.fonts.regular
  },
  forgot_button: {
    height: 30,
    marginBottom: 30,
  },
  loginBtn: {
    width: "40%",
    borderRadius: 25,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
    backgroundColor: appTheme.colors.warnAction,

  },
  loginText: {
    color: appTheme.colors.warnActionTxt
  },
  error: {
    color: "red",
    fontSize: 10,
    marginLeft: 5
  },
  backgroundImage: {
    flex: 1,
    alignSelf: 'stretch',
    width: null,
  }
});