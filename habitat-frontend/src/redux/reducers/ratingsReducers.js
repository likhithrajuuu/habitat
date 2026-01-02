import {
    GET_COUNT_RATINGS,
    GET_COUNT_RATINGS_SUCCESS,
    GET_COUNT_RATINGS_FAILURE
} from "./ratings.types";

const initialState = {
    count: 0,
    loading: false,
    error: null
};

const ratingsReducer = (state = initialState, action) => {
    switch (action.type) {

        case GET_COUNT_RATINGS:
            return {
                ...state,
                loading: true,
                error: null
            };

        case GET_COUNT_RATINGS_SUCCESS:
            return {
                ...state,
                loading: false,
                count: action.payload
            };

        case GET_COUNT_RATINGS_FAILURE:
            return {
                ...state,
                loading: false,
                error: action.payload
            };

        default:
            return state;
    }
};

export default ratingsReducer;