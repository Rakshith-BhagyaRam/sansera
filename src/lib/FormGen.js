import React, { Component } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity } from "react-native";
import { appTheme } from "./Themes";
import { Picker } from '@react-native-picker/picker';
import { util } from '../commons';

export default class FormGen extends Component {
    constructor(props) {
      super(props);
    }
    componentDidMount(){

    }
    render(){
      let content = <></>;
      if(this.props.groupBy){
        let flexNo = 1;
        if (this.props.groupBy === 2) flexNo = 1
        content = this.props.groups.map((groupItem, groupIndex) => {
          return (
            <View
              key={groupIndex}
              style={{flexDirection: 'row', flexWrap: 'wrap',backgroundColor:'white',flex:1}}
            >
              {groupItem.map((item, index) => {
                return (
                  <View key={index} style={{backgroundColor:'white',flex:1,margin:5}}>
                    <View style={this.props.labelDataInRow ? styles.formDataItemRow : styles.formItem} >
                      {item.displayName && item.displayName.length ? <Text style={styles.formLabel}>
                        {item.displayName}
                      </Text> : false}
                      {item.select ?
                        <Picker
                          selectedValue={item.titleCase ? util.capitalizeWord(item.value) : item.value}
                          onValueChange={this.props.handleChange(item.key)}
                          mode="dialog"
                          style={{ backgroundColor: "#ECF0FA" }}
                          itemStyle={{}}
                          dropdownIconColor={appTheme.colors.cardTitle}
                        >
                          {console.log("item options "+JSON.stringify(item.options))}
                          {item.options && item.options.map((pickerItem, pickerIndex) => {
                            let labelV = (item.keyName && pickerItem[item.keyName]) ? pickerItem[item.keyName] : (pickerItem.key ? pickerItem.key : pickerItem);
                            let label = (item.valueName && pickerItem[item.valueName]) ? pickerItem[item.valueName] : (pickerItem.value ? pickerItem.value : pickerItem);
                            console.log(labelV+" ... "+label)
                            if (item.titleCase) labelV = util.titleCase(labelV)
                            return (<Picker.Item style={{ backgroundColor: "#ECF0FA" }} label={label} value={labelV} key={pickerIndex} />)
                          })}
                        </Picker>
                        :
                        <TextInput name={item.key}
                          style={[styles.TextInput, { 
                            opacity: (item.value && item.value.length) ? 1 : 0.6,
                            backgroundColor: this.props.editMode === false ? 'white' : '#ECF0FA'
                          }]}
                          placeholder={item.placeholder}
                          placeholderTextColor="#fafafa"
                          onChangeText={this.props.handleChange(item.key)}
                          keyboardType={item.type ? 'numeric' : 'default'}
                          editable={this.props.editMode}
                          value={item.value+""}
                        />}
                      {item.error && item.error.length ? (<Text style={styles.error}> {item.error} </Text>) : (false)}

                    </View>
                 
                    
                  </View>
                );
              })}
            </View>
          );
        });
      }
      else
      { 
        content = this.props.formData.map((item, index) => {
          return (
            <View style={{ margin: 1, flexDirection: 'column', }} key={index}>
                <View style={[this.props.labelDataInRow ? styles.formDataItemRow : styles.formItem,{
                  }]} >
                    
                {item.displayName && item.displayName.length ? <Text 
                  style={[this.props.labelDataInRow ? styles.formLabelInRow : styles.formLabel, { 
                    flex: this.props.labelFlex ? this.props.labelFlex : 1 }]}
                >
                  {item.displayName}
                </Text> : false}
                <View style={{
                  flex: this.props.dataFlex ? this.props.dataFlex : 2
}}>
                {item.select ?
                  <Picker
                    selectedValue={item.titleCase ? util.capitalizeWord(item.value) : item.value}
                    onValueChange={this.props.handleChange(item.key)}
                    mode="dialog"
                    style={[this.props.labelDataInRow ? styles.pickerItemInRow : styles.pickerItem, { backgroundColor: this.props.editMode === false ? "red" : '#ECF0FA' }]}
                    itemStyle={{}}
                    dropdownIconColor={appTheme.colors.cardTitle}
                  >
                    {item.options && item.options.map((pickerItem, pickerIndex) => {
                      let labelV = (item.keyName && pickerItem[item.keyName]) ? pickerItem[item.keyName] : (pickerItem.key ? pickerItem.key : pickerItem);
                      let label = (item.valueName && pickerItem[item.valueName]) ? pickerItem[item.valueName] : (pickerItem.value ? pickerItem.value : pickerItem);
                      console.log(labelV+" .. "+label)
                      if (item.titleCase) label = util.titleCase(label); 
                      return (<Picker.Item style={{ backgroundColor: "#ECF0FA" }} label={label} value={labelV} key={pickerIndex} />)
                    })}
                  </Picker>
                  :
                  <TextInput name={item.key}
                    style={[this.props.labelDataInRow ? styles.textInputInRow : styles.TextInput, 
                      { backgroundColor: this.props.editMode === false ? "white" : '#ECF0FA',
                    }]}
                    placeholder={item.placeholder}
                    placeholderTextColor="#fafafa"
                    onChangeText={this.props.handleChange(item.key)}
                    keyboardType={item.type && item.type === "number" ? 'numeric' : 'default'}
                    editable={this.props.editMode}
                    value={item.value+""}
                  />}
                </View>
                </View>
                  {item.error && item.error.length ? (<Text style={styles.error}> {item.error} </Text>) : (false)}

            </View>
          )
        })
      }

      return (
        <>{content}</>
      )
    }
   
 

}
const styles = StyleSheet.create({
  formItem :{
    flexDirection: 'column',
    width: '100%',
  },
  formDataItemRow :{
    flexDirection:'row',
    width: '100%',
  },
  pickerItemInRow:{
    flex:2
  },
  pickerItem:{

  },
  textInputInRow:{
   // height: 50,
    textAlign: 'left',
    fontSize: 14,
    color: 'black',
    fontFamily: appTheme.fonts.regular,
   // backgroundColor: "#ECF0FA",
    flex:2,
  },
  TextInput: {
    //height: 50,
    textAlign: 'left',
    fontSize: 14,
    color: 'black',
    fontFamily: appTheme.fonts.regular,
    //backgroundColor: "#ECF0FA",
  },
  error: {
    color: "red",
    fontSize: 14
  },
  formLabel: {
    fontSize: 14,
    fontFamily: appTheme.fonts.regular,
    textAlign: 'left',

  },
  formLabelInRow:{
    textAlign: 'left',
    flex: 1,
    fontSize: 14,
    fontFamily: appTheme.fonts.regular,
    alignContent:'center',
    justifyContent:'center',
    alignSelf:'center'
  }
});
