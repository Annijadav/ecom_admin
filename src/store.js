// src/store.js
import { configureStore, createSlice } from '@reduxjs/toolkit'
import loginReducer from './redux/Slice/loginSlice'

// Sidebar & Theme slice (converted from legacy createStore)
const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    sidebarShow: true,
    theme: 'light',
  },
  reducers: {
    setUIState: (state, action) => {
      return { ...state, ...action.payload }
    },
  },
})

export const { setUIState } = uiSlice.actions

const store = configureStore({
  reducer: {
    login: loginReducer,
    ui: uiSlice.reducer, // 🎯 replaces legacy store
  },
})

export default store
