import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {ApiService} from '../../httpservice';
import UserContext from '../UserContext';
import CustomModal from '../../components/CustomModal';
import {useIsFocused} from '@react-navigation/native';
import {appTheme} from '../../lib/Themes';
import {default as AppStyles} from '../../styles/AppStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ErrorModal from '../../components/ErrorModal';
import {EmptyBinContext} from '../../context/EmptyBinContext';
import {RadioButton} from 'react-native-paper';
import {stageType} from '../../constants/appConstants';

export const EmptyBin = React.memo(props => {
  const [apiError, setApiError] = useState('');
  const [apiStatus, setApiStatus] = useState(false);
  const userState = React.useContext(UserContext);
  const [dialog, showDialog] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogMessage, setDialogMessage] = useState('');
  const [dialogType, setDialogType] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const isFocused = useIsFocused();
  const [notifications, setNotifications] = useState([]);
  const [stage, setStage] = useState('');
  const [bin, setBin] = useState({});
  const [currentStage, setCurrentStage] = useState({});
  const [nextStageName, setNextStageName] = useState('');
  const [nextStage, setNextStage] = useState({});
  const {setUnReadEmptyBinData, appProcess} = React.useContext(EmptyBinContext);
  useEffect(() => {
    if (isFocused) {
      loadData();
    }
    return () => {};
  }, [isFocused, appProcess.process_name]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadData();
  }, []);

  const loadData = async () => {
    let request = await AsyncStorage.getItem('emptyBinReq');

    setNotifications(JSON.parse(request));

    //
    // console.log('notifications ++++ ' + request);

    let stage = await AsyncStorage.getItem('stage');
    setStage(stage);
    let currentStage = appProcess.process.find(
      item => item.stage_name === stage,
    );
    //hardcode
    //if (currentStage.stage_name.toLowerCase() === stageType.visual) currentStage.output_stage = stageType.shotblasting
    setCurrentStage(currentStage);
    //hardcode
    // if(currentStage.stage_name.toLowerCase() === stageType.forging) currentStage.sub_stage = stageType.underheat
    console.log('currentStage here ' + JSON.stringify(currentStage));
    if (currentStage.order) {
      let nextStage = appProcess.process.find(
        item => item.order === currentStage.order + 1,
      );
      console.log('nextStage here ' + JSON.stringify(nextStage));
      if (nextStage) {
        console.log('defulat ' + nextStage.stage_name);
        setNextStageName(nextStage.stage_name);
        setNextStage(nextStage);
      }
    }
    setTimeout(() => {
      setUnReadEmptyBinData('0');
    }, 3000);
  };

  const closeDialog = () => {
    showDialog(false);
    setDialogTitle('');
    setDialogMessage('');
    setDialogType('');
    setBin({});
  };
  const openDialog = (e, type, item) => {
    showDialog(true);
    let dialogTitle = '';
    let dialogMessage = '';
    setDialogType(type);
    if (type === 'cancel') {
      dialogTitle = 'Cancel Bin Request';
      dialogMessage =
        'Are you sure you wish to cancel empty bin request ' + item.element_num;
    }
    if (type === 'accept') {
      dialogTitle = 'Accept Bin Request';
      dialogMessage =
        'Are you sure you wish to accept empty bin request of ' +
        item.element_num;
    }
    setDialogTitle(dialogTitle);
    setDialogMessage(dialogMessage);
    setBin(item);
  };

  const updateRequest = () => {
    if (dialogType === 'cancel') {
      //remove from list
      AsyncStorage.getItem('emptyBinReq').then(emptyBinReqList => {
        let binReq = JSON.parse(emptyBinReqList);
        let index = binReq.findIndex(
          item => item.element_num === bin.element_num,
        );
        if (index !== undefined) {
          binReq.splice(index, 1);

    
            AsyncStorage.setItem('emptyBinReq', JSON.stringify(binReq));
       

          setNotifications(binReq);
          closeDialog();
        }
      });
    }
    if (dialogType === 'accept') {
      let apiData = {op: 'push_element'};
      apiData.process_name = appProcess.process_name;
      apiData.element_num = bin.element_num;
      apiData.element_id = bin.element_id;

      let currentStage = appProcess.process.find(
        item => item.stage_name === stage,
      );
      //hardcode
      if (currentStage.stage_name.toLowerCase() === stageType.visual)
        currentStage.output_stage = stageType.shotblasting;
      console.log(currentStage.output_stage);
      apiData.stage_name = nextStage.stage_name;
      console.log('apiData 1' + JSON.stringify(apiData));
      console.log(nextStageName);
      if (nextStageName.length) apiData.stage_name = nextStageName;
      if (
        currentStage &&
        currentStage.output_stage &&
        currentStage.output_stage.length &&
        nextStageName.length === 0
      ) {
        apiData.stage_name = currentStage.output_stage;
      }

      console.log('apiData here ' + JSON.stringify(apiData));

      setApiStatus(true);
      ApiService.getAPIRes(apiData, 'POST', 'process').then(apiRes => {
        setApiStatus(false);
        if (apiRes && apiRes.status) {
          Alert.alert('Bin confirmed');
          closeDialog();
          props.reloadPage();
        } else if (apiRes && apiRes.response.message)
          setApiError(apiRes.response.message);
      });
      AsyncStorage.getItem('emptyBinReq').then(emptyBinReqList => {
        let binReq = JSON.parse(emptyBinReqList);
        let index = binReq.findIndex(
          item => item.element_num === bin.element_num,
        );
        if (index !== undefined) {
          binReq.splice(index, 1);
          AsyncStorage.setItem('emptyBinReq', JSON.stringify(binReq));
          setNotifications(binReq);
          closeDialog();
        }
      });
    }
  };

  const errOKAction = () => {
    setApiError('');
  };

  const handleRequestType = name => value => {
    setNextStageName(value);
  };
  return (
    <ScrollView
      contentContainerStyle={styles.scrollView}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
      <View style={styles.mainContainer}>
        {notifications && notifications.length
          ? notifications.map((item, index) => {
              return (
                <View
                  style={{
                    flexDirection: 'row',
                    padding: 5,
                    backgroundColor: 'white',
                    margin: 5,
                  }}
                  key={index}>
                  <Text
                    style={[
                      AppStyles.subtitle,
                      {
                        flex: 3,
                        justifyContent: 'flex-start',
                        textAlign: 'left',
                        color: 'black',
                        padding: 5,
                      },
                    ]}>
                    {'Confirm Bin request ' + item.element_num}
                  </Text>
                  <TouchableOpacity
                    style={[AppStyles.successBtn, {flex: 1, margin: 5}]}
                    onPress={e => openDialog(e, 'accept', item)}>
                    <Text style={AppStyles.successText}>CONFIRM</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[AppStyles.canButtonContainer, {flex: 1, margin: 5}]}
                    onPress={e => openDialog(e, 'cancel', item)}>
                    <Text style={AppStyles.canButtonTxt}>CANCEL</Text>
                  </TouchableOpacity>
                </View>
              );
            })
          : false}
        {dialog ? (
          <CustomModal
            modalVisible={dialog}
            dialogTitle={dialogTitle}
            dialogMessage={dialogMessage}
            okDialog={updateRequest}
            closeDialog={closeDialog}
            container={
              <View
                style={{
                  flexDirection: 'column',
                  alignItems: 'center',
                  width: '70%',
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    width: '70%',
                    padding: 3,
                  }}>
                  <Text
                    style={[
                      AppStyles.subtitle,
                      {flex: 1, justifyContent: 'flex-start', color: 'black'},
                    ]}>
                    Bin :{' '}
                  </Text>
                  <Text
                    style={[
                      AppStyles.title,
                      {
                        flex: 2,
                        textAlign: 'left',
                        color: appTheme.colors.cardTitle,
                        fontFamily: appTheme.fonts.bold,
                      },
                    ]}>
                    {bin.element_num}{' '}
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    width: '70%',
                    padding: 3,
                  }}>
                  <Text
                    style={[
                      AppStyles.subtitle,
                      {flex: 1, justifyContent: 'flex-start', color: 'black'},
                    ]}>
                    Stage :{' '}
                  </Text>
                  <Text
                    style={[
                      AppStyles.title,
                      {
                        flex: 2,
                        textAlign: 'left',
                        color: appTheme.colors.cardTitle,
                        fontFamily: appTheme.fonts.bold,
                      },
                    ]}>
                    {stage}{' '}
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    width: '70%',
                    padding: 3,
                  }}>
                  <Text
                    style={[
                      AppStyles.subtitle,
                      {flex: 1, justifyContent: 'flex-start', color: 'black'},
                    ]}>
                    Process :{' '}
                  </Text>
                  <Text
                    style={[
                      AppStyles.title,
                      {
                        flex: 2,
                        textAlign: 'left',
                        color: appTheme.colors.cardTitle,
                        fontFamily: appTheme.fonts.bold,
                      },
                    ]}>
                    {appProcess.process_name}{' '}
                  </Text>
                </View>
                {currentStage.sub_stage && currentStage.sub_stage.length ? (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      width: '70%',
                      padding: 3,
                    }}>
                    <Text
                      style={[
                        AppStyles.subtitle,
                        {flex: 1, justifyContent: 'flex-start', color: 'black'},
                      ]}>
                      Move Bin to :{' '}
                    </Text>
                    <View style={{flex: 2}}>
                      <RadioButton.Group
                        onValueChange={value => setNextStageName(value)}
                        value={nextStageName}
                        style={{}}>
                        <View
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'center',
                            alignSelf: 'center',
                          }}>
                          <RadioButton value={nextStage.stage_name} />
                          <Text
                            style={[
                              AppStyles.radioText,
                              {
                                color: appTheme.colors.cardTitle,
                                marginRight: 15,
                                fontSize: 20,
                              },
                            ]}>
                            {nextStage.stage_name}
                          </Text>
                          <RadioButton value={currentStage.sub_stage} />
                          <Text
                            style={[
                              AppStyles.radioText,
                              {color: appTheme.colors.cardTitle, fontSize: 20},
                            ]}>
                            {currentStage.sub_stage}
                          </Text>
                        </View>
                      </RadioButton.Group>
                    </View>
                  </View>
                ) : (
                  false
                )}

                {/* {currentStage.order && currentStage.output_stage && currentStage.output_stage.length ?
                <View style={{ flexDirection: 'row', alignItems: 'center', width: '70%', padding: 5 }}>
                  <Text style={[AppStyles.subtitle, { flex: 1, justifyContent: 'flex-start', color: 'black' }]}>Move Bin to : </Text>
                  <View style={{ flex: 2 }}>
                    <RadioButton.Group
                      onValueChange={(value) => setNextStageName(value)}
                      value={nextStageName}
                      style={{}}
                    >
                      <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', alignSelf: 'center' }} >
                        <RadioButton value={nextStage.stage_name} />
                        <Text style={[AppStyles.radioText, { color: appTheme.colors.cardTitle, marginRight: 15, fontSize: 20 }]}>{nextStage.stage_name}</Text>
                        <RadioButton value={currentStage.output_stage} />
                        <Text style={[AppStyles.radioText, { color: appTheme.colors.cardTitle, fontSize: 20 }]}>{currentStage.output_stage}</Text>
                      </View>
                    </RadioButton.Group>
                  </View>
                </View> : false} */}
              </View>
            }
          />
        ) : (
          false
        )}

        {apiError && apiError.length ? (
          <ErrorModal msg={apiError} okAction={errOKAction} />
        ) : (
          false
        )}
      </View>
    </ScrollView>
  );
});
const styles = StyleSheet.create({
  mainContainer: {
    justifyContent: 'center',
    margin: 10,
  },
});
