import{
    GET_COUNT_RATINGS,
    GET_COUNT_RATINGS_SUCCESS,
    GET_COUNT_RATINGS_FAILURE,
} from "../constants/ratingsConstants";
import axios from "axios";
import api from "../../api/axios";

export const getRatingsCount = () => (movieId) => async (dispatch) => {
    dispatch({
        type: GET_COUNT_RATINGS,
    });

    try{
        const response = await api.get(`/ratings/count/${movieId}`);
        dispatch({
            type: GET_COUNT_RATINGS_SUCCESS,
            payload: response.data,
        });
    }
    catch(error){
        dispatch({
            type: GET_COUNT_RATINGS_FAILURE,
            payload: error?.response?.data || "Failed to fetch ratings count",
        });
    }
};