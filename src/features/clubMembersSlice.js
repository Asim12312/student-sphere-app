import { createSlice } from '@reduxjs/toolkit'

const membersSlice = createSlice({
  name: 'membersCount',
  initialState: {
    joinedMembers: 0,
    createdClubMembersCount: 0,
    allClubMembers: {},
  },
   reducers: {
    setJoinedMembers: (state, action) => {
      state.joinedMembers = action.payload;
    },
    setCreatedClubMembersCount: (state, action) => {
      state.createdClubMembersCount = action.payload;
    },
    setAllClubMembers: (state, action) => {
      state.allClubMembers = action.payload;
    },
      },
});

export const { setJoinedMembers, setCreatedClubMembersCount, setAllClubMembers } = membersSlice.actions;
export default membersSlice.reducer;