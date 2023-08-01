import React from 'react';

export default React.createContext({
  userEntity:{},
  processStage: '',
  taskCount:0,
 // emptyBinCount: 0,
  filledBinCount:0,
  setUserEntity:(user) => {},
  setProcessStage : (stage) => {},
  setTaskCount:(count) => {},
  //setEmptyBinCount:(count) => {},
  setFilledBinCount:(count) => {},
});