// authSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  userId: string | null;
  email: string | null;
  imageUrl: string;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  userId: null,
  email: null,
  imageUrl: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    signInSuccess: (
      state,
      action: PayloadAction<{ userId: string; email: string; imageUrl: string }>
    ) => {
      state.userId = action.payload.userId;
      state.email = action.payload.email;
      state.imageUrl = action.payload.imageUrl;
      state.isAuthenticated = true;
    },
    signOut: (state) => {
      state.userId = null;
      state.email = null;
      state.isAuthenticated = false;
      state.imageUrl = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
    },
  },
});

export const { signInSuccess, signOut } = authSlice.actions;
export default authSlice.reducer;
