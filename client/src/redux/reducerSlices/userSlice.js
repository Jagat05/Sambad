import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  username: "Guest",
  email: "",
  token: "",
  role: "member",
  isLoggedIn: false,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    logoutUser: () => initialState,
    addLoggedinDetails: (state, action) => {
      return {
        ...state,
        username: action.payload.user.username,
        email: action.payload.user.email,
        token: action.payload.token,
        role: action.payload.user.role,
        isLoggedIn: true,
      };
    },
  },
});

export const { logoutUser, addLoggedinDetails } = userSlice.actions;

export default userSlice.reducer;
