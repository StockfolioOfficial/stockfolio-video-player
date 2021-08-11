import React, { createContext, useState } from "react";

interface repeatTimelineStateType {
  startTime: number;
  endTime: number;
  duration: number;
}

interface repeatControllerStateType {
  startTime: number;
  endTime: number;
  duration: number;
}

interface repeatOptionType {
  minTime: number;
  maxTime: number;
}

interface RepeatStoreType {
  state: {
    repeatTimelineState: repeatTimelineStateType;
    repeatControllerState: repeatControllerStateType;
    repeatOption: repeatOptionType;
    isRepeat: boolean;
  };
  action: {
    setRepeatTimelineState: React.Dispatch<
      React.SetStateAction<repeatTimelineStateType>
    >;
    setRepeatControllerState: React.Dispatch<
      React.SetStateAction<repeatControllerStateType>
    >;
    setRepeatOption: React.Dispatch<React.SetStateAction<repeatOptionType>>;
    setIsRepeat: React.Dispatch<React.SetStateAction<boolean>>;
  };
}

const defaultRepeatStoreData: RepeatStoreType = {
  state: {
    repeatTimelineState: {
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
  },
  action: {
    setRepeatTimelineState: () => undefined,
    setRepeatControllerState: () => undefined,
    setRepeatOption: () => undefined,
    setIsRepeat: () => undefined,
  },
};

const repeatStore = createContext(defaultRepeatStoreData);

const RepeatProvider = ({ children }: { children: React.ReactNode }) => {
  const [repeatTimelineState, setRepeatTimelineState] = useState(
    defaultRepeatStoreData.state.repeatTimelineState
  );
  const [repeatControllerState, setRepeatControllerState] = useState(
    defaultRepeatStoreData.state.repeatControllerState
  );
  const [repeatOption, setRepeatOption] = useState(
    defaultRepeatStoreData.state.repeatOption
  );
  const [isRepeat, setIsRepeat] = useState(
    defaultRepeatStoreData.state.isRepeat
  );

  const value: typeof defaultRepeatStoreData = {
    state: {
      repeatTimelineState,
      repeatControllerState,
      repeatOption,
      isRepeat,
    },
    action: {
      setRepeatTimelineState,
      setRepeatControllerState,
      setRepeatOption,
      setIsRepeat,
    },
  };

  return (
    <repeatStore.Provider value={{ state: value.state, action: value.action }}>
      {children}
    </repeatStore.Provider>
  );
};

export { RepeatProvider };

export default repeatStore;
