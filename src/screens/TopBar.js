
import React, { useEffect } from "react";
import { StyleSheet, Text, View, Image,TouchableOpacity } from 'react-native';
import { util } from "../commons";
import UserContext from "./UserContext";
import { SvgCss } from 'react-native-svg';
import { AppIcon } from '../svgs/AppIcon';
import { appTheme } from "../lib/Themes";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Login from "./Login";
import AppContext from "../context/AppContext";

const TopBar = (props) => {
  const userState = React.useContext(UserContext);
  let [user, setUser] = React.useState({})
  let { processStage } =  React.useContext(AppContext)

  useEffect(() => {
    let isMounted = true;
    if(userState && userState.user)
      setUser(userState.user);
    
    return () => {
      isMounted = false;
    }
  }, [])

  
  return (
    <>{user ?
    <View style={{ display: 'flex' }}>
      <View style={{ flexDirection: 'row', padding: 10, display: 'flex',
       backgroundColor: appTheme.colors.topBarBackground }}>
        <SvgCss xml={AppIcon} width={40} height={40} />
          {processStage && processStage.length ? <Text style={{
            color: appTheme.colors.topBarTxt, fontSize: 16, alignSelf: 'center',
            fontFamily: appTheme.fonts.semiBold,marginLeft:10
          }}>{processStage}</Text>:false}
        <View style={{
          flexDirection: "column", flex: 4, justifyContent: 'center', alignContent: 'center',
          alignItems: 'center'
        }}>
            <Image
            style={styles.tinyLogo}
            source={require('../images/sansera.png')} />
        </View>

        <View style={{
          justifyContent: 'center', alignContent: 'center', flexDirection: 'row', alignItems: 'center'
        }}> 
          {user && user.memberName ?
            <Text style={{ color: appTheme.colors.topBarTxt, fontSize: 10, alignSelf: 'center', 
            fontFamily: appTheme.fonts.semiBold }}>Welcome {util.capitalize(user.memberName)}</Text> : false}
            <TouchableOpacity onPress={(e) => props.openLogOut(e)} style={{marginLeft:20}}>
              <FontAwesome name="sign-out" size={30} color={appTheme.colors.topBarTxt} ></FontAwesome>
            </TouchableOpacity></View>
        </View>
      </View>
       : <Login />}

      
    </>
  )
   
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default TopBar;
