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

const safeBase64UrlDecode = (input) => {
  if (!input || typeof input !== "string") return null;
  try {
    const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    return decodeURIComponent(
      Array.from(atob(padded))
        .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, "0")}`)
        .join("")
    );
  } catch {
    return null;
  }
};

const decodeJwtPayload = (token) => {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length < 2) return null;
  const json = safeBase64UrlDecode(parts[1]);
  if (!json) return null;
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
};

const deriveUserFromToken = (token) => {
  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload !== "object") return null;

  const username =
    payload.username ||
    payload.preferred_username ||
    payload.user_name ||
    payload.login ||
    null;

  const email = payload.email || null;
  const name = payload.name || payload.full_name || null;

  // Some providers put the email in `sub`.
  const subject = typeof payload.sub === "string" ? payload.sub : null;
  const subjectEmail = subject && subject.includes("@");

  const resolvedEmail = email || (subjectEmail ? subject : null);
  const resolvedUsername = username || (resolvedEmail ? resolvedEmail.split("@")[0] : null);

  if (!resolvedUsername && !resolvedEmail && !name) return null;

  return {
    username: resolvedUsername,
    email: resolvedEmail,
    name,
    raw: payload,
  };
};

const initialState = {
  token: localStorage.getItem("token"),
  loading: false,
  isAuthenticated: !!localStorage.getItem("token"),
  user: deriveUserFromToken(localStorage.getItem("token")),
  error: null,
};

export const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOGIN_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case LOGIN_SUCCESS:
      {
        const token =
          typeof action.payload === "string"
            ? action.payload
            : action.payload?.token ||
              action.payload?.accessToken ||
              action.payload?.access_token ||
              null;

        const user = action.payload?.user || deriveUserFromToken(token);

        return {
          ...state,
          loading: false,
          token: token || action.payload,
          user,
          isAuthenticated: true,
        };
      }

    case LOGIN_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
        isAuthenticated: false,
      };

    case REGISTER_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case REGISTER_SUCCESS:
      {
        const token =
          typeof action.payload === "string"
            ? action.payload
            : action.payload?.token ||
              action.payload?.accessToken ||
              action.payload?.access_token ||
              null;

        const user = action.payload?.user || deriveUserFromToken(token);

        return {
          ...state,
          loading: false,
          token: token || action.payload,
          user,
          isAuthenticated: true,
        };
      }

    case REGISTER_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
        isAuthenticated: false,
      };

    case CLEAR_AUTH_ERROR:
      return {
        ...state,
        error: null,
      };

    case LOGOUT:
      return {
        token: null,
        loading: false,
        isAuthenticated: false,
        user: null,
        error: null,
      };

    default:
      return state;
  }
};