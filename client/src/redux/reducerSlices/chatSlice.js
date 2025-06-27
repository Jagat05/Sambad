import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedChat: null,
  chats: [],
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setSelectedChat: (state, action) => {
      state.selectedChat = action.payload;
    },
    setChats: (state, action) => {
      state.chats = action.payload;
    },
    addNewMessage: (state, action) => {
      const { chatId, message } = action.payload;

      if (state.selectedChat?._id === chatId) {
        state.selectedChat = {
          ...state.selectedChat,
          messages: [...(state.selectedChat.messages || []), message],
        };
      }

      const chatIndex = state.chats.findIndex((chat) => chat._id === chatId);
      if (chatIndex !== -1) {
        const updatedChats = [...state.chats];
        updatedChats[chatIndex].lastMessage = message;
        state.chats = updatedChats;
      }
    },
  },
});

export const { setSelectedChat, setChats, addNewMessage } = chatSlice.actions;
export default chatSlice.reducer;
