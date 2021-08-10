import React from "react";

const defaultRepeatStore = {
  repeatViewState: {
    startTime: 0,
    endTime: 0,
    duration: 0,
  },
  repeatControllerState: {
    startTime: 0,
    endTime: 0,
    duration: 0,
  },
  repeatOption: {
    minTime: 1,
    maxTime: 2,
  },
  isRepeat: false,
};

const repeatStore = React.createContext(defaultRepeatStore);
