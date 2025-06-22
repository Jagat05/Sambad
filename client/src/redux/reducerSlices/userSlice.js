import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  username: "Guest",
  token: "",
  email: "",
  role: "guest",
  isLoggedIn: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser(state, action) {
      state.username = action.payload.username;
      state.token = action.payload.token;
      state.email = action.payload.email;
      state.role = action.payload.role;
      state.isLoggedIn = true;
    },
    logoutUser(state) {
      state.username = "Guest";
      state.token = "";
      state.email = "";
      state.role = "guest";
      state.isLoggedIn = false;
    },
  },
});

export const { setUser, logoutUser } = userSlice.actions;
export default userSlice.reducer;
