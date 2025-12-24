import api from "../../api/axios";
import {
  GET_ALL_MOVIES,
  GET_ALL_MOVIES_SUCCESS,
  GET_ALL_MOVIES_FAILURE,
  GET_MOVIE_BY_ID,
  GET_MOVIE_BY_ID_SUCCESS,
  GET_MOVIE_BY_ID_FAILURE,
  GET_MOVIES_BY_GENRE,
  GET_MOVIES_BY_GENRE_SUCCESS,
  GET_MOVIES_BY_GENRE_FAILURE,
  GET_MOVIES_BY_FORMAT,
  GET_MOVIES_BY_FORMAT_SUCCESS,
  GET_MOVIES_BY_FORMAT_FAILURE,
  GET_MOVIES_BY_LANGUAGE,
  GET_MOVIES_BY_LANGUAGE_SUCCESS,
  GET_MOVIES_BY_LANGUAGE_FAILURE,
  ADD_MOVIE,
  ADD_MOVIE_SUCCESS,
  ADD_MOVIE_FAILURE,
  UPDATE_MOVIE,
  UPDATE_MOVIE_SUCCESS,
  UPDATE_MOVIE_FAILURE,
  DELETE_MOVIE,
  DELETE_MOVIE_SUCCESS,
  DELETE_MOVIE_FAILURE,
  CLEAR_MOVIE_ERROR,
} from "../constants/movieConstants";

const toMessageString = (value) => {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    return value.message || value.error || value.details || value.title || null;
  }
  return null;
};

const normalizeMovieError = (error, fallback) => {
  if (!error?.response) {
    return "Unable to reach the server. Please check your connection and try again.";
  }

  const data = error?.response?.data;
  const message = (toMessageString(data) || toMessageString(error?.message) || fallback || "Request failed")
    .toString()
    .trim();

  return message;
};

export const clearMovieError = () => (dispatch) => {
  dispatch({ type: CLEAR_MOVIE_ERROR });
};

export const getAllMovies = () => async (dispatch) => {
  try {
    dispatch({ type: GET_ALL_MOVIES });
    const { data } = await api.get("/movies/getall");
    dispatch({ type: GET_ALL_MOVIES_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: GET_ALL_MOVIES_FAILURE,
      payload: normalizeMovieError(error, "Failed to fetch movies"),
    });
  }
};

export const getMovieById = (id) => async (dispatch) => {
  try {
    dispatch({ type: GET_MOVIE_BY_ID });
    const { data } = await api.get(`/movies/get/${id}`);
    dispatch({ type: GET_MOVIE_BY_ID_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: GET_MOVIE_BY_ID_FAILURE,
      payload: normalizeMovieError(error, "Failed to fetch movie"),
    });
  }
};

export const getMoviesByGenre = (genreName) => async (dispatch) => {
  try {
    dispatch({ type: GET_MOVIES_BY_GENRE });
    const { data } = await api.get(`/movies/genre/${encodeURIComponent(genreName)}`);
    dispatch({ type: GET_MOVIES_BY_GENRE_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: GET_MOVIES_BY_GENRE_FAILURE,
      payload: normalizeMovieError(error, "Failed to fetch movies by genre"),
    });
  }
};

export const getMoviesByFormat = (formatName) => async (dispatch) => {
  try {
    dispatch({ type: GET_MOVIES_BY_FORMAT });
    const { data } = await api.get(`/movies/format/${encodeURIComponent(formatName)}`);
    dispatch({ type: GET_MOVIES_BY_FORMAT_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: GET_MOVIES_BY_FORMAT_FAILURE,
      payload: normalizeMovieError(error, "Failed to fetch movies by format"),
    });
  }
};

export const getMoviesByLanguage = (languageName) => async (dispatch) => {
  try {
    dispatch({ type: GET_MOVIES_BY_LANGUAGE });
    const { data } = await api.get(`/movies/language/${encodeURIComponent(languageName)}`);
    dispatch({ type: GET_MOVIES_BY_LANGUAGE_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: GET_MOVIES_BY_LANGUAGE_FAILURE,
      payload: normalizeMovieError(error, "Failed to fetch movies by language"),
    });
  }
};

export const addMovie = (movie) => async (dispatch) => {
  try {
    dispatch({ type: ADD_MOVIE });
    const { data } = await api.post("/movies/add", movie);
    dispatch({ type: ADD_MOVIE_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: ADD_MOVIE_FAILURE,
      payload: normalizeMovieError(error, "Failed to add movie"),
    });
  }
};

export const updateMovie = (movie) => async (dispatch) => {
  try {
    dispatch({ type: UPDATE_MOVIE });
    const { data } = await api.put("/movies/update", movie);
    dispatch({ type: UPDATE_MOVIE_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: UPDATE_MOVIE_FAILURE,
      payload: normalizeMovieError(error, "Failed to update movie"),
    });
  }
};

export const deleteMovie = (id) => async (dispatch) => {
  try {
    dispatch({ type: DELETE_MOVIE });
    const { data } = await api.delete(`/movies/delete/${id}`);
    dispatch({ type: DELETE_MOVIE_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: DELETE_MOVIE_FAILURE,
      payload: normalizeMovieError(error, "Failed to delete movie"),
    });
  }
};
