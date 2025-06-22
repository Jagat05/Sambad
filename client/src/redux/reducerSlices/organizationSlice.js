import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedOrganization: null,
};

const organizationSlice = createSlice({
  name: "organization",
  initialState,
  reducers: {
    setSelectedOrganization(state, action) {
      state.selectedOrganization = action.payload;
    },
  },
});

export const { setSelectedOrganization } = organizationSlice.actions;
export default organizationSlice.reducer;
