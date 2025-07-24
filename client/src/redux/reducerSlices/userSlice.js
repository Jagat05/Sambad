import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  id: null,
  username: "Guest",
  token: "",
  email: "",
  role: "guest",
  isLoggedIn: false,
  avatar: "",
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser(state, action) {
      state.id = action.payload.id;
      state.username = action.payload.username;
      state.token = action.payload.token;
      state.email = action.payload.email;
      state.role = action.payload.role;
      state.isLoggedIn = true;
      state.avatar = action.payload.avatar || "";
    },
    updateAvatar(state, action) {
      state.avatar = action.payload;
    },
    logoutUser(state) {
      state.id = null;
      state.username = "Guest";
      state.token = "";
      state.email = "";
      state.role = "guest";
      state.isLoggedIn = false;
      state.avatar = "";
    },
  },
});

export const { setUser, logoutUser, updateAvatar } = userSlice.actions;
export default userSlice.reducer;
