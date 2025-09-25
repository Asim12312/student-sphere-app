import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios';

// Async thunks for API calls
export const fetchClubMembersCount = createAsyncThunk(
  'members/fetchClubMembersCount',
  async (clubs) => {
    const response = await axios.post('http://localhost:3000/handleMember/clubMembersCount', { clubs });
    return response.data.membersCount;
  }
);

export const fetchClubMemberCount = createAsyncThunk(
  'members/fetchClubMemberCount',
  async (clubId) => {
    const response = await axios.get(`http://localhost:3000/handleMember/clubMemberCount/${clubId}`);
    return response.data;
  }
);

export const fetchClubMembers = createAsyncThunk(
  'members/fetchClubMembers',
  async (clubId) => {
    const response = await axios.get(`http://localhost:3000/handleMember/clubMembers/${clubId}`);
    return response.data;
  }
);

const membersSlice = createSlice({
  name: 'membersCount',
  initialState: {
    joinedMembers: 0,
    createdClubMembersCount: 0,
    allClubMembers: 0,
    clubMembers: {},
    memberCounts: {},
    loading: false,
    error: null
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
    updateMemberCount: (state, action) => {
      const { clubId, count } = action.payload;
      state.memberCounts[clubId] = count;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchClubMembersCount
      .addCase(fetchClubMembersCount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClubMembersCount.fulfilled, (state, action) => {
        state.loading = false;
        action.payload.forEach(item => {
          state.memberCounts[item.clubId] = item.count;
        });
      })
      .addCase(fetchClubMembersCount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // fetchClubMemberCount
      .addCase(fetchClubMemberCount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClubMemberCount.fulfilled, (state, action) => {
        state.loading = false;
        state.memberCounts[action.payload.clubId] = action.payload.memberCount;
      })
      .addCase(fetchClubMemberCount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // fetchClubMembers
      .addCase(fetchClubMembers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClubMembers.fulfilled, (state, action) => {
        state.loading = false;
        state.clubMembers[action.payload.clubName] = action.payload.members;
        state.memberCounts[action.payload.clubName] = action.payload.totalMembers;
      })
      .addCase(fetchClubMembers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});

export const { 
  setJoinedMembers, 
  setCreatedClubMembersCount, 
  setAllClubMembers, 
  updateMemberCount,
  clearError 
} = membersSlice.actions;

export default membersSlice.reducer;
