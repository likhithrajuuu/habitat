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

const initialListState = {
  loading: false,
  movies: [],
  error: null,
};

export const movieListReducer = (state = initialListState, action) => {
  switch (action.type) {
    case GET_ALL_MOVIES:
      return { ...state, loading: true, error: null };
    case GET_ALL_MOVIES_SUCCESS:
      return { ...state, loading: false, movies: Array.isArray(action.payload) ? action.payload : [], error: null };
    case GET_ALL_MOVIES_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case CLEAR_MOVIE_ERROR:
      return { ...state, error: null };
    default:
      return state;
  }
};

const initialDetailsState = {
  loading: false,
  movie: null,
  error: null,
};

export const movieDetailsReducer = (state = initialDetailsState, action) => {
  switch (action.type) {
    case GET_MOVIE_BY_ID:
      return { ...state, loading: true, error: null };
    case GET_MOVIE_BY_ID_SUCCESS:
      return { ...state, loading: false, movie: action.payload ?? null, error: null };
    case GET_MOVIE_BY_ID_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case CLEAR_MOVIE_ERROR:
      return { ...state, error: null };
    default:
      return state;
  }
};

const initialFilterState = {
  loading: false,
  movies: [],
  error: null,
};

export const moviesByGenreReducer = (state = initialFilterState, action) => {
  switch (action.type) {
    case GET_MOVIES_BY_GENRE:
      return { ...state, loading: true, error: null };
    case GET_MOVIES_BY_GENRE_SUCCESS:
      return { ...state, loading: false, movies: Array.isArray(action.payload) ? action.payload : [], error: null };
    case GET_MOVIES_BY_GENRE_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case CLEAR_MOVIE_ERROR:
      return { ...state, error: null };
    default:
      return state;
  }
};

export const moviesByFormatReducer = (state = initialFilterState, action) => {
  switch (action.type) {
    case GET_MOVIES_BY_FORMAT:
      return { ...state, loading: true, error: null };
    case GET_MOVIES_BY_FORMAT_SUCCESS:
      return { ...state, loading: false, movies: Array.isArray(action.payload) ? action.payload : [], error: null };
    case GET_MOVIES_BY_FORMAT_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case CLEAR_MOVIE_ERROR:
      return { ...state, error: null };
    default:
      return state;
  }
};

export const moviesByLanguageReducer = (state = initialFilterState, action) => {
  switch (action.type) {
    case GET_MOVIES_BY_LANGUAGE:
      return { ...state, loading: true, error: null };
    case GET_MOVIES_BY_LANGUAGE_SUCCESS:
      return { ...state, loading: false, movies: Array.isArray(action.payload) ? action.payload : [], error: null };
    case GET_MOVIES_BY_LANGUAGE_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case CLEAR_MOVIE_ERROR:
      return { ...state, error: null };
    default:
      return state;
  }
};

const initialCrudState = {
  loading: false,
  success: false,
  movie: null,
  error: null,
};

export const movieCreateReducer = (state = initialCrudState, action) => {
  switch (action.type) {
    case ADD_MOVIE:
      return { ...state, loading: true, success: false, error: null };
    case ADD_MOVIE_SUCCESS:
      return { ...state, loading: false, success: true, movie: action.payload ?? null, error: null };
    case ADD_MOVIE_FAILURE:
      return { ...state, loading: false, success: false, error: action.payload };
    case CLEAR_MOVIE_ERROR:
      return { ...state, error: null };
    default:
      return state;
  }
};

export const movieUpdateReducer = (state = initialCrudState, action) => {
  switch (action.type) {
    case UPDATE_MOVIE:
      return { ...state, loading: true, success: false, error: null };
    case UPDATE_MOVIE_SUCCESS:
      return { ...state, loading: false, success: true, movie: action.payload ?? null, error: null };
    case UPDATE_MOVIE_FAILURE:
      return { ...state, loading: false, success: false, error: action.payload };
    case CLEAR_MOVIE_ERROR:
      return { ...state, error: null };
    default:
      return state;
  }
};

export const movieDeleteReducer = (state = { loading: false, success: false, error: null }, action) => {
  switch (action.type) {
    case DELETE_MOVIE:
      return { loading: true, success: false, error: null };
    case DELETE_MOVIE_SUCCESS:
      return { loading: false, success: true, error: null };
    case DELETE_MOVIE_FAILURE:
      return { loading: false, success: false, error: action.payload };
    case CLEAR_MOVIE_ERROR:
      return { ...state, error: null };
    default:
      return state;
  }
};
