import React from 'react';
import AppContext from './AppContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default class AppContextState extends React.Component {
  state = {
    userEntity:{},
    tasks: [],
    processStage:'',
    taskCount: 0,
    //emptyBinCount: 0,
    filledBinCount: 0
  }

  setUserEntity =( user) =>{
    this.setState({userEntity:user})
  }
  setProcessStage = (stage) => {
    this.setState({ processStage:stage})
  }



  setTaskCount = (count) => {
    this.setState({taskCount:count})
  }

  // setEmptyBinCount = (count) => {
  //   this.setState({ emptyBinCount: count })
  // }
  setFilledBinCount = (count) => {
    this.setState({ filledBinCount: count })

  }
  addNewTask = (task) => {
    const list = [...this.state.tasks, task];
    this.setState({ tasks: list });
  };

  deleteTask = (taskId) => {
    this.setState(this.state.tasks.splice(taskId, 1));
  };
  render() {
    return (
      <AppContext.Provider
        value={{
          userEntity:this.state.userEntity,
          setUserEntity: this.setUserEntity,
          tasks: this.state.tasks,
          addNewTask: this.addNewTask,
          deleteTask: this.deleteTask,
          processStage:this.state.processStage,
          setProcessStage:this.setProcessStage,
          taskCount:this.state.taskCount,
          setTaskCount:this.setTaskCount,
        //  emptyBinCount:this.state.emptyBinCount,
         // setEmptyBinCount:this.setEmptyBinCount,
          filledBinCount:this.state.filledBinCount,
          setFilledBinCount:this.setFilledBinCount
        }}
      >
        {this.props.children}
      </AppContext.Provider>
    );
  }
}