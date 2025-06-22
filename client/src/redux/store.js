import { configureStore } from "@reduxjs/toolkit";
import organizationReducer from "./reducerSlices/organizationSlice";
import userReducer from "./reducerSlices/userSlice";

const store = configureStore({
  reducer: {
    user: userReducer,
    organization: organizationReducer,
  },
});

export default store;
