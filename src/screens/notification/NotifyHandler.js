/* eslint-disable prettier/prettier */
import { Platform } from 'react-native';
import PushNotification from 'react-native-push-notification';
import messaging from '@react-native-firebase/messaging';
//custom
import { handleNotificationNavig } from './NavigationHandler';
import * as React from 'react';
import { EmptyBinContext } from '../../context/EmptyBinContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

//request permission for notifications
const requestPermission = async () => {
    try {
        const authStatus = await messaging().requestPermission();
        const enabled =
            authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
            authStatus === messaging.AuthorizationStatus.PROVISIONAL;
        if (enabled) {
            //let fcmToken = await messaging().getToken();
        }
    } catch (error) {
        console.log(error);
    }
};

//subscribe to topic
export const subscribeToTopic = (topic) => {
    messaging()
        .subscribeToTopic(topic)
        .then(() => console.log('Subscribed to topic!' + topic));
};

//clear topic
export const clearTopics = (topic) => {
    messaging().unsubscribeFromTopic(topic)
        .then(() => console.log('unsubscribed to topic!' + topic));
};

const onRemoteNotification = (notification) => {
    const isClicked = notification.getData().userInteraction === 1;
    if (isClicked) {
        // Navigate user to another screen
    } else {
        // Do something else with push notification
    }
};

//init notification, on background, on active state, on close of app
export const initNotification = async (openNotificationHandler) => {
    requestPermission();
    // if (Platform.OS === 'ios') {
    //     PushNotificationIOS.addEventListener('notification', onRemoteNotification);
    // }F
    PushNotification.configure({
        onNotification: function (notification) {

            // (required) Called when a remote is received or opened, or local notification is opened
            //notification.userInteraction = 1;
            console.log("userInteraction " + notification.userInteraction)
            let notifyData = JSON.parse(notification.data.data);
            console.log("notify data on load " + JSON.stringify(notifyData))

            //check if rack or bin

            if (notification.userInteraction) {
                console.log('notification on user interaction ', notification);
                handleNotificationNavig(notification, openNotificationHandler);
            }
            else if (notification.data && notification.foreground && !notifyData.sender) {
                console.log("background notficiation without user interaction " + JSON.stringify(notification.data))
                handleNotificationNavig(notification, openNotificationHandler)
            }
        },
        popInitialNotification: true,

    });
    PushNotification.deleteChannel('com.sansera');
    PushNotification.channelExists('com.sansera', (resp) => {
        console.log(`createChannel created '${resp}'`);
        if (!resp) {
            //create channel for receiving notification on active state of phone
            PushNotification.createChannel(
                {
                    channelId: 'com.sansera', // (required)
                    channelName: 'com.sansera', // (required)
                    soundName: 'default', // (optional) See `soundName` parameter of `localNotification` function
                    importance: 4, // (optional) default: 4. Int value of the Android notification importance
                    vibrate: true, // (optional) default: true. Creates the default vibration patten if true.
                },
                (created) => console.log(`createChannel returned '${created}'`)
                // (optional) callback returns whether the channel was created, false means it already existed.
            );
        }
    });

    let unsubscribe = null;
    unsubscribe = messaging().onMessage(async remoteMessage => {
        console.log('A new FCM message arrived!', JSON.stringify(remoteMessage) + Platform.OS);
        if (remoteMessage && remoteMessage.notification) {
            var localNotification = {
                default: '',
                title: remoteMessage && remoteMessage.notification && remoteMessage.notification.title || '', // (optional)
                message: remoteMessage && remoteMessage.notification && remoteMessage.notification.body || '', // (required)
                data: remoteMessage && remoteMessage.data,
                channelId: ''
            };
            console.log("localNotification content " + JSON.stringify(localNotification))
            //use the channel for showing notification as local notification
            Platform.OS === 'android' && (
                localNotification = {
                    ...localNotification,
                    channelId: 'com.sansera', // (required) channelId, if the channel doesn't exist, notification will not trigger.
                }
            );
            PushNotification.localNotification(localNotification);
        }
    });

    messaging()
        .getInitialNotification()
        .then(async (remoteMessage) => {
            if (remoteMessage) {
                console.log(
                    'getInitialNotification:' +
                    'Notification caused app to open from quit state',
                );
                console.log(remoteMessage);
            }
        });

    //handle notification open background state
    messaging().onNotificationOpenedApp(() => {
    });


    messaging().setBackgroundMessageHandler(async remoteMessage => {
        console.log('Message handled in the background!', remoteMessage);
        // let notification = remoteMessage.data;
        // let notifyData = JSON.parse(notification)
        handleNotificationNavig(remoteMessage, openNotificationHandler);

    });

    return unsubscribe;
};
