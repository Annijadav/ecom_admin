import { GET, POST, PUT } from "../../config/api_helper";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  LOGIN_URL,
  FORGOT_PASSWORD_URL,
  RESET_PASSWORD_URL,
  CHANGE_PASSWORD_URL,
  UPDATE_PROFILE_URL,
  GET_PROFILE_URL,
} from "../../config/url_helper";
import { toast } from "react-toastify";

// Async thunk for login
export const login = createAsyncThunk(
  "login/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await POST(LOGIN_URL, credentials);
      console.log("Login response:", response);

      if (response.statusCode === 200) {
        console.log("Login response:", response);
        const { token, ...admin } = response;

        // Store in localStorage immediately
        localStorage.setItem("authToken", token);
        localStorage.setItem("userData", JSON.stringify(admin));

        return { token, user: admin };
      } else {
        return rejectWithValue(response || "Login failed");
      }
    } catch (error) {
      return rejectWithValue(
        response || "Login failed"
      );
    }
  }
);

// get profile
export const getProfile = createAsyncThunk(
  "login/getProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await GET(GET_PROFILE_URL); // Replace with your actual URL

      if (response.statusCode === 200) {
        // Update localStorage with fresh user data
        const userData = response.admin;
        // localStorage.setItem('userData', JSON.stringify(userData))
        return userData;
      } else {
        return rejectWithValue(
          response.data?.message || "Failed to fetch profile"
        );
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch profile"
      );
    }
  }
);

// Async thunk for logout
export const logout = createAsyncThunk(
  "login/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      // Remove token from localStorage
      localStorage.removeItem("authToken");
      localStorage.removeItem("userData");
      return null;
    } catch (error) {
      return rejectWithValue("Logout failed");
    }
  }
);

// forgot password
export const forgotPassword = createAsyncThunk(
  "login/forgotPassword",
  async (email, { rejectWithValue }) => {
    try {
      const response = await POST(FORGOT_PASSWORD_URL, email);
      if (response.statusCode === 200) {
        return response.data;
      } else {
        return rejectWithValue(
          response.data?.message || "Forgot password failed"
        );
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Forgot password failed"
      );
    }
  }
);

// reset password
export const resetPassword = createAsyncThunk(
  "login/resetPassword",
  async ({ token, password }, { rejectWithValue }) => {
    try {      
      const response = await POST(`${RESET_PASSWORD_URL}`, { password, token });
      if (response.statusCode === 200) {
        return response.data;
      } else {
        return rejectWithValue(
          response.data?.message || "Reset password failed"
        );
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Reset password failed"
      );
    }
  }
);

// change password

export const changePassword = createAsyncThunk(
  "login/changePassword",
  async ({ currentPassword, newPassword }, { rejectWithValue }) => {
    try {
      const response = await PUT(CHANGE_PASSWORD_URL, {
        currentPassword,
        newPassword,
      });

      if (response.statusCode === 200) {
        return response.data;
      } else {
        return rejectWithValue(
          response.data?.message || "Change password failed"
        );
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Change password failed"
      );
    }
  }
);

// profile update

export const updateProfile = createAsyncThunk(
  "login/updateProfile",
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await PUT(UPDATE_PROFILE_URL, profileData);

      if (response.statusCode === 200) {
        // Update localStorage with new user data
        const { user } = response.data;
        // localStorage.setItem('userData', JSON.stringify(user))
        return response.data;
      } else {
        return rejectWithValue(
          response.data?.message || "Update profile failed"
        );
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Update profile failed"
      );
    }
  }
);

// ✅ FIX: Improved function to check auth status
export const checkAuthStatus = () => {
  const token = localStorage.getItem("authToken");
  const userData = localStorage.getItem("userData");

  if (token) {
    try {
      const parsedUserData = userData ? JSON.parse(userData) : null;
      return {
        token,
        user: parsedUserData,
      };
    } catch (error) {
      console.error("Error parsing userData from localStorage:", error);
      // If userData is corrupted, remove both items
      localStorage.removeItem("authToken");
      localStorage.removeItem("userData");
      return null;
    }
  }
  return null;
};

const loginSlice = createSlice({
  name: "login",
  initialState: {
    isLoading: false,
    isError: false,
    errorMessage: "",
    userData: null,
    token: null,
    isAuthenticated: false,
  },
  reducers: {
    // Manual actions
    clearError: (state) => {
      state.isError = false;
      state.errorMessage = "";
    },
    resetLoginState: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.errorMessage = "";
      state.userData = null;
      state.token = null;
      state.isAuthenticated = false;
    },
    // ✅ FIX: Initialize auth state from localStorage
    initializeAuth: (state) => {
      const authData = checkAuthStatus();
      if (authData) {
        state.userData = authData.user;
        state.token = authData.token;
        state.isAuthenticated = true;
      } else {
        state.userData = null;
        state.token = null;
        state.isAuthenticated = false;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.errorMessage = "";
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        // ✅ FIX: Better handling of user data
        state.userData = action.payload.user || action.payload;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.isError = false;
        state.errorMessage = "";
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload || "Login failed";
        state.userData = null;
        state.token = null;
        state.isAuthenticated = false;
      })
      // Logout cases
      .addCase(logout.fulfilled, (state) => {
        state.userData = null;
        state.token = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        state.isError = false;
        state.errorMessage = "";
      });
  },
});

export const { clearError, resetLoginState, initializeAuth } =
  loginSlice.actions;
export default loginSlice.reducer;
