import React, { Component } from 'react';
import { StyleSheet, Text, View} from "react-native";
import { appTheme } from "./Themes";


export default class FormGrid extends Component {
  constructor(props) {
    super(props);
  }
  componentDidMount() {

  }
  render() {
    let content = <></>;
    if (this.props.groupBy) {
      let flexNo = 1;
      if (this.props.groupBy === 2) flexNo = 1
      content = this.props.groups.map((groupItem, groupIndex) => {
        return (
          <View
            key={groupIndex}
            style={{ flexDirection: 'row', flexWrap: 'wrap', backgroundColor: 'white', flex: 1 }}
          >
            {groupItem.map((item, index) => {
              return (
                <View key={index} style={{ backgroundColor: 'white', flex: 1, margin: 5 }}>
                  <View style={[this.props.labelDataInRow ? styles.formDataItemRow : styles.formItem],{padding:5}} >
                    {item.displayName && item.displayName.length ? <Text style={styles.formLabel}>
                      {item.displayName}
                    </Text> : false}

                      <Text name={item.key}
                        style={[styles.TextInput, { opacity: (item.value && item.value.length) ? 1 : 0.6, backgroundColor:  'white' }]}
                      >{item.value+""}</Text>
                    {item.error && item.error.length ? (<Text style={styles.error}> {item.error} </Text>) : (false)}
                  </View>
                </View>
              );
            })}
          </View>
        );
      });
    }
    else {
      content = this.props.formData.map((item, index) => {
        return (
          <View style={{ margin: 1, flexDirection: 'column', }} key={index}>
            <View style={[this.props.labelDataInRow ? styles.formDataItemRow : styles.formItem, {padding:5
            }]} >

              {item.displayName && item.displayName.length ? <Text
                style={[this.props.labelDataInRow ? styles.formLabelInRow : styles.formLabel, {
                  flex: this.props.labelFlex ? this.props.labelFlex : 1
                }]}
              >
                {item.displayName}
              </Text> : false}
              <View style={{
                flex: this.props.dataFlex ? this.props.dataFlex : 2
              }}>
                  <Text name={item.key}
                    style={[this.props.labelDataInRow ? styles.textInputInRow : styles.TextInput, { backgroundColor:  "white" }]}
                  >{item.value+""}
                  
                  </Text>
              </View>
            </View>
            {item.error && item.error.length ? (<Text style={styles.error}> {item.error} </Text>) : (false)}

          </View>
        )
      })
    }

    return (
      <View style={{marginTop:20}}>{content}</View >
    )
  }



}
const styles = StyleSheet.create({
  formItem: {
    flexDirection: 'column',
    width: '100%',
  },
  formDataItemRow: {
    flexDirection: 'row',
    width: '100%',
  },
  pickerItemInRow: {
    flex: 2
  },
  pickerItem: {

  },
  textInputInRow: {
    // height: 50,
    textAlign: 'left',
    fontSize: 14,
    color: 'black',
    fontFamily: appTheme.fonts.regular,
    // backgroundColor: "#ECF0FA",
    flex: 2,
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
  formLabelInRow: {
    textAlign: 'left',
    flex: 1,
    fontSize: 14,
    fontFamily: appTheme.fonts.regular,
    alignContent: 'center',
    justifyContent: 'center',
    alignSelf: 'center'
  }
});
