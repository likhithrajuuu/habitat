import api from "../../api/axios";
import {
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_FAILURE,
  REGISTER_REQUEST,
  REGISTER_SUCCESS,
  REGISTER_FAILURE,
  LOGOUT,
  CLEAR_AUTH_ERROR,
} from "../constants/authConstants";

const toMessageString = (value) => {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    return (
      value.message ||
      value.error ||
      value.details ||
      value.title ||
      null
    );
  }
  return null;
};

const normalizeAuthError = (error, fallback) => {
  // Axios-style error shape
  const status = error?.response?.status;
  const data = error?.response?.data;

  const rawMessage =
    toMessageString(data) ||
    toMessageString(error?.response?.data?.error) ||
    toMessageString(error?.message) ||
    null;

  const message = (rawMessage || "").toString().trim();
  const lowered = message.toLowerCase();

  // Network / CORS / server down
  if (!error?.response) {
    return "Unable to reach the server. Please check your connection and try again.";
  }

  // Friendly mappings for common auth failures
  if (status === 401 || status === 403) {
    return "Invalid email or password.";
  }

  if (lowered.includes("invalid credentials")) {
    return "Invalid email or password.";
  }

  if (lowered.includes("bad credentials")) {
    return "Invalid email or password.";
  }

  if (lowered.includes("user not exists") || lowered.includes("user not found")) {
    return "No account found with that email. Please register first.";
  }

  if (lowered.includes("email") && lowered.includes("exist")) {
    return "Email already exists.";
  }

  if (lowered.includes("username") && lowered.includes("exist")) {
    return "Username already exists.";
  }

  if (message) return message;
  return fallback;
};

export const login = (userData) => async (dispatch) => {
  try {
    dispatch({ type: LOGIN_REQUEST });

    const { data } = await api.post("/auth/login", userData);

    // Accept either raw token string or an object like { token }
    const token = typeof data === "string" ? data : data?.token;
    if (token) localStorage.setItem("token", token);

    dispatch({
      type: LOGIN_SUCCESS,
      payload: {
        token: token || data,
        user: {
          email: userData?.email || null,
        },
      },
    });
  } catch (error) {
    dispatch({
      type: LOGIN_FAILURE,
      payload: normalizeAuthError(error, "Login failed"),
    });
  }
};

export const register = (userData) => async (dispatch) => {
  try {
    dispatch({ type: REGISTER_REQUEST });

    const { data } = await api.post("/auth/register", userData);

    // If register returns token, store it and mark authenticated.
    const token = typeof data === "string" ? data : data?.token;
    if (token) localStorage.setItem("token", token);

    dispatch({
      type: REGISTER_SUCCESS,
      payload: {
        token: token || data,
        user: {
          email: userData?.email || null,
          username: userData?.username || null,
        },
      },
    });
  } catch (error) {
    dispatch({
      type: REGISTER_FAILURE,
      payload: normalizeAuthError(error, "Registration failed"),
    });
  }
};

export const clearAuthError = () => (dispatch) => {
  dispatch({ type: CLEAR_AUTH_ERROR });
};

export const logout = () => (dispatch) => {
  localStorage.removeItem("token");
  dispatch({ type: LOGOUT });
};