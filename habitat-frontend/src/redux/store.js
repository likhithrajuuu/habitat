import { createStore, applyMiddleware, combineReducers } from "redux";
import { thunk } from "redux-thunk"; 
import { authReducer } from "./reducers/authReducer";
import {
  movieListReducer,
  movieDetailsReducer,
  moviesByGenreReducer,
  moviesByFormatReducer,
  moviesByLanguageReducer,
  movieCreateReducer,
  movieUpdateReducer,
  movieDeleteReducer,
} from "./reducers/movieReducers";

const rootReducer = combineReducers({
  auth: authReducer,
  movieList: movieListReducer,
  movieDetails: movieDetailsReducer,
  moviesByGenre: moviesByGenreReducer,
  moviesByFormat: moviesByFormatReducer,
  moviesByLanguage: moviesByLanguageReducer,
  movieCreate: movieCreateReducer,
  movieUpdate: movieUpdateReducer,
  movieDelete: movieDeleteReducer,
});

const store = createStore(rootReducer, applyMiddleware(thunk));

export default store;