import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  onlineUsers: [], // string[] userIds
};

const onlineSlice = createSlice({
  name: "online",
  initialState,
  reducers: {
    userOnline: (state, action) => {
      const userId = action.payload;
      if (!state.onlineUsers.includes(userId)) {
        state.onlineUsers.push(userId);
      }
    },
    userOffline: (state, action) => {
      const userId = action.payload;
      state.onlineUsers = state.onlineUsers.filter((id) => id !== userId);
    },
    resetOnlineUsers: (state) => {
      state.onlineUsers = [];
    },
    setOnlineUsers: (state, action) => {
      // Useful for initial fetch from backend if needed
      state.onlineUsers = action.payload;
    },
  },
});

export const { userOnline, userOffline, resetOnlineUsers, setOnlineUsers } =
  onlineSlice.actions;

export default onlineSlice.reducer;
