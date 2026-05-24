import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

export const fetchProfile = createAsyncThunk("auth/fetchProfile", async (_, thunkAPI) => {
  try {
    const response = await api.get("/auth/me");
    const user = response.data.data;
    localStorage.setItem("user", JSON.stringify(user));
    return user;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to fetch profile");
  }
});

export const updateProfile = createAsyncThunk("auth/updateProfile", async (updates, thunkAPI) => {
  try {
    const response = await api.patch("/auth/me", updates);
    const user = response.data.data;
    localStorage.setItem("user", JSON.stringify(user));
    return user;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to update profile");
  }
});

export const login = createAsyncThunk("auth/login", async (credentials, thunkAPI) => {
  try {
    const response = await api.post("/auth/login", credentials);
    const { user, token } = response.data.data;
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    return { user, token };
  } catch (error) {
    const errors = error.response?.data?.errors;
    let msg = error.response?.data?.message || "Login failed";
    if (errors && errors.length > 0) {
      if (typeof errors[0] === "object" && errors[0].msg) {
        msg = errors.map((e) => e.msg).join(". ");
      } else if (typeof errors[0] === "string") {
        msg = errors.join(". ");
      }
    }
    return thunkAPI.rejectWithValue(msg);
  }
});

export const register = createAsyncThunk("auth/register", async (payload, thunkAPI) => {
  try {
    const response = await api.post("/auth/register", payload);
    const { user, token } = response.data.data;
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    return { user, token };
  } catch (error) {
    const errors = error.response?.data?.errors;
    let msg = error.response?.data?.message || "Registration failed";
    if (errors && errors.length > 0) {
      if (typeof errors[0] === "object" && errors[0].msg) {
        msg = errors.map((e) => e.msg).join(". ");
      } else if (typeof errors[0] === "string") {
        msg = errors.join(". ");
      }
    }
    return thunkAPI.rejectWithValue(msg);
  }
});

const initialState = {
  user: JSON.parse(localStorage.getItem("user")) || null,
  token: localStorage.getItem("token") || null,
  isAuthenticated: !!localStorage.getItem("token"),
  status: "idle", // idle | loading | succeeded | failed
  error: null,
  isInitializing: !!localStorage.getItem("token"),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isInitializing = false;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
    updateWishlist: (state, action) => {
      if (state.user) {
        state.user.wishlist = action.payload;
      }
    },
    clearError: (state) => {
      state.error = null;
      state.status = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.status = "loading";
        state.error = null;
        state.isInitializing = true;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.isAuthenticated = true;
        state.user = action.payload;
        state.isInitializing = false;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.status = "failed";
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        state.error = action.payload;
        state.isInitializing = false;
      })
      .addCase(login.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(register.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(register.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(updateProfile.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { logout, updateWishlist, clearError } = authSlice.actions;
export default authSlice.reducer;
