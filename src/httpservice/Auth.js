import AsyncStorage from '@react-native-async-storage/async-storage';




class Auth {
    getUserInfo() {
        // if (
        //     localStorage.getItem("userInfo") !== undefined &&
        //     localStorage.getItem("userInfo") !== null &&
        //     localStorage.getItem("userInfo") !== "undefined"
        // ) {
        //     return JSON.parse(localStorage.getItem("userInfo"));
        // }
        return null;
    }

    getToken () {
        // return localStorage.getItem("token");
        return AsyncStorage.getItem('token')

    }

    isTokenAlive() {
        // if (this.getToken() === null || this.getUserInfo() === null)
        //     return false;
        // return true;
    }
}

export default new Auth();