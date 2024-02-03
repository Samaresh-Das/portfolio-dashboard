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

//function to handle localStorage
const loadAuthFromLocalStorage = (): AuthState => {
  const storedAuthData = localStorage.getItem("authData");
  if (storedAuthData) {
    const { userId, email, imageUrl } = JSON.parse(storedAuthData);
    return { userId, email, imageUrl, isAuthenticated: true };
  }
  return initialState;
};

const authSlice = createSlice({
  name: "auth",
  initialState: loadAuthFromLocalStorage(),
  reducers: {
    signInSuccess: (
      state,
      action: PayloadAction<{ userId: string; email: string; imageUrl: string }>
    ) => {
      state.userId = action.payload.userId;
      state.email = action.payload.email;
      state.imageUrl = action.payload.imageUrl;
      state.isAuthenticated = true;
      localStorage.setItem(
        "authData",
        JSON.stringify({
          userId: action.payload.userId,
          email: action.payload.email,
          imageUrl: action.payload.imageUrl,
          isAuthenticated: true,
        })
      );
      console.log(state.email);
    },
    logOut: (state) => {
      state.userId = null;
      state.email = null;
      state.isAuthenticated = false;
      state.imageUrl = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
      localStorage.removeItem("authData");
    },
  },
});

export const { signInSuccess, logOut } = authSlice.actions;
export default authSlice.reducer;
