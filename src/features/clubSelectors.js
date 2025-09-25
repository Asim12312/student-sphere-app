import { createSelector } from '@reduxjs/toolkit';

// Basic selectors
const selectMembersState = state => state.members;

// Memoized selectors
export const selectAllClubMembers = createSelector(
  [selectMembersState],
  (members) => members?.allClubMembers || {}
);

export const selectJoinedMembersCount = createSelector(
  [selectMembersState],
  (members) => members?.joinedMembers || 0
);

export const selectCreatedClubMembersCount = createSelector(
  [selectMembersState],
  (members) => members?.createdClubMembersCount || 0
);

// Selector for specific club members (when we implement club-specific data)
export const selectClubMembersById = createSelector(
  [selectAllClubMembers, (state, clubId) => clubId],
  (allMembers, clubId) => allMembers[clubId] || []
);
