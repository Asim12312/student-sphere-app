import { configureStore } from '@reduxjs/toolkit'
import cartReducer from '../features/cartSlice'
import memberReducer from '../features/clubMembersSlice'
export const store = configureStore({
  reducer: {
     counter: cartReducer,
     members: memberReducer
  },
})