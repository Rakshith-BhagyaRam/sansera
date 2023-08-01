
import { regularExpData } from "../constants"

const util = {};

util.capitalize = (str) =>{
    if(str ===null || str === "" || str === undefined) return str;
    return str.charAt(0).toUpperCase()+str.slice(1)
}

util.titleCase = (str) => {
    if (str === null || str === "" || str === undefined) return str;
    str = str.toLowerCase()
    return str.charAt(0).toUpperCase() + str.slice(1)
}

util.capitalizeWord = (str) => {
    if (str === null || str === "" || str === undefined) return str;
    return str.split(' ').map(w => w.substring(0, 1).toUpperCase() + w.substring(1)).join(' ')
}
util.chunkArray = (chunk_size, arr) => {
    return arr
        .map(function (e, i) {
            return i % chunk_size === 0 ? arr.slice(i, i + chunk_size) : null;
        })
        .filter(function (e) {
            return e;
        });
};
util.formatForm = (inputForm) => {
    let mergedArr = [];
    inputForm.forEach(value => {
        mergedArr.push({ ...value });
    });
    return mergedArr;
}

util.filterFormData = async obj => {
    let apiFormData = [...obj];
    let formData = {};
    apiFormData.map(item => {
        if (item.value !== undefined && item.value !== null) {
            if (item.type === "number" && item.value.toString().length === 0) {
                // let key = item["key"];
                // let value = item["value"];
                // formData[key] = value;
            } else if (
                item.type === "number" &&
                (item.value.toString() === NaN ||
                    item.value.toString() === "NaN")
            ) {
                // let key = item["key"];
                // let value = item["value"];
                // formData[key] = value;
            } else {
                let key = item["key"];
                let value = item["value"];
                if(item.lowerCase)
                    formData[key] = value.toLowerCase();
                else
                    formData[key] = value;
            }
        }
    });
    return formData;
};

util.resetForm = formData => {
    let inputForm = [...formData]
    let mergedArr = [];
    inputForm.forEach(item => {
        item.value = item.defaultValue ? item.defaultValue :""
        mergedArr.push({ ...item });
    });

    return mergedArr;
};

util.setForm = formData => {
    let inputForm = [...formData];
    let mergedArr = [];
    inputForm.forEach(value => {
        mergedArr.push({ ...value });
    });

    return mergedArr;
}


util.validateFormData = async (obj) => {
    obj.map(item => {
        if (item.value != undefined && item.value != null && item.type !== "number" && item.value.toString().length) {
            item.value = (typeof (item["value"]) == "string") ? item["value"].trim() : item["value"]
        }
        let value = item["value"];
        if (item.type === "number" && item.value.toString().length > 0){
            item.value = parseInt(value)
        }
        if (item.type === "number" && item.value.toString().length == 0)
            item.value = 0

        item.error = ""

        if (item.required) {
            if (item.value == undefined || item.value.toString() === "NaN" || item.value.toString() === NaN ||
                (item.value != undefined && item.value.toString().length === 0)
            ) {
                item["error"] = "Please enter "+item.label + "";
            }
        }
        if (item.nonZero && item.value === 0 && item.type === "number") item.error = "Please enter valid " + item.label + "";

        let validValue = true;
        if (item.type === "number") {
            if (item.value === null || item.value.toString() === NaN || item.value.toString() === "NaN")
                validValue = false;
        }
        else if (item.type != "number" && (item.value == undefined || item.value == null ||
            item.value.toString() == "NaN" || item.value.toString() == NaN))
            validValue = false;



        if (validValue) {
            let fieldObj = regularExpData.find(obj => obj.name.toLowerCase() === item["key"].toLowerCase())
            if (fieldObj && fieldObj.regExp) {
             
                if (value != undefined && value.toString().length > 0) {
                    if ((item.key === "pinCode" || item.key === "altPhoneNumber") && item.value === 0)
                        item['error'] = ""
                    else {
                        let status = fieldObj.regExp.test(value) ? true : false;

                        if (status) {
                            item["error"] = "";
                            if (item.validatorFunc) {
                                let status1 = item.validatorFunc(value);
                                if (!status1) item["error"] = (item.validatorMsg ? item.validatorMsg : "Invalid data")
                            }
                        }
                        else
                            item['error'] = fieldObj.message;
                    }

                }

            }


        }



    })
    return obj;
}



export default util;
