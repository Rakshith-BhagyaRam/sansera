import { urls } from "../constants";
import Auth from "./Auth"

class HttpService {
    makeRequest(methodType, content, type,token) {
        let reqURL = urls[type.trim()];  
        console.log("reqURL : "+reqURL)
        if (methodType === "POST")
            return fetch(reqURL, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + token
                },
                credentials: "omit",
                method: methodType,
                body: JSON.stringify(content)
            });
        else if (methodType === "GET") {
            return fetch(reqURL, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + token
                },
                credentials: "omit",
                method: methodType
            });
        }
    }
}

export default new HttpService();
