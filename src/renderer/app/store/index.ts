import { configureStore } from "@reduxjs/toolkit";
import projectReducer from "./slices/projectSlice";
import comportReducer from "./slices/comportSlice";
import deviceReducer from "./slices/deviceSlice";
import floorReducer from "./slices/floorSlice";
import roomReducer from "./slices/roomSlice";
import motorReducer from "./slices/motorSlice";
import deviceConfigReducer from "./slices/deviceConfigSlice";
import groupViewReducer from "./slices/groupViewSlice";
import transmitterReducer from "./slices/transmitterSlice";
import receiverReducer from "./slices/receiverSlice";
import keypadReducer from "./slices/keypadSlice";
import communicationLogReducer from "./slices/communicationLogSlice";

export const store = configureStore({
  reducer: {
    project: projectReducer,
    comport: comportReducer,
    device: deviceReducer,
    floor: floorReducer,
    room: roomReducer,
    motor: motorReducer,
    deviceConfig: deviceConfigReducer,
    groupView: groupViewReducer,
    transmitter: transmitterReducer,
    receiver: receiverReducer,
    keypad: keypadReducer,
    communicationLog: communicationLogReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
