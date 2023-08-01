import  HttpService  from "./HttpService";
import { appMsgs } from "../constants";
import Auth from "./Auth";
import NetInfo from "@react-native-community/netinfo";

let ApiService = {};

ApiService.genFailure = data => {
    return {
        status: appMsgs.FAIL_MSG,
        message: data.message ? data.message : "",
        errors: data.errors ? data.errors : []
    };
};
ApiService.handleRes = function(res) {
  
    let response = {};
    response.msgType = 1;
    response.response = res.body
    response.status = (res.status === 200 || res.status === 201) ? true: false
    if(res.status === 200 || res.status === 201) response.msgType = 1;
    else if(res.status === 500 || res.status === 503) response.msgType = 3;
    else response.msgType = 2;
    return response;
}

ApiService.onSuccess = function(res) {
   
        let response = res.data;
        response.msgType = 3;
        response.status = false;
        response.response = res.body
        return response;
    
};

ApiService.onFailure = function (errorRes) {
    if (errorRes.response) {
        let response = errorRes.response.data;

        return response;
    }
};

ApiService.getAPIRes = async(params, type, api, props) => {
    
    try {
        let res = {
            status: "failure",
            message: ""
        };
      
        let networkState = await NetInfo.fetch();
        if(networkState.isConnected){
            let token = await Auth.getToken();
            return new Promise((resolve, reject) => {
                HttpService.makeRequest(type, params, api, token)
                    .then(r => r.json().then(data => ({ status: r.status, body: data })))
                    .then(res => resolve(ApiService.handleRes(res)))
                    .catch(res => resolve(ApiService.onFailure(res)));
            });
        }
        else
        {
            return { "status": false, response:{ message:"No Internet"}};
        }

        
    } catch (e) {
        console.log(e);
        
        ApiService.genFailure({ errors: [e.toString()] });
    }
};

export { ApiService };
