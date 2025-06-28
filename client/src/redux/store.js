import { configureStore, combineReducers } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage";
import { persistReducer, persistStore } from "redux-persist";

import userReducer from "./reducerSlices/userSlice";
import organizationReducer from "./reducerSlices/organizationSlice";
import chatReducer from "./reducerSlices/chatSlice";

const rootReducer = combineReducers({
  user: userReducer,
  organization: organizationReducer,
  chat: chatReducer,
});

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["user", "organization", "chat"], // persist these slices
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // required for redux-persist
    }),
});

export const persistor = persistStore(store);
