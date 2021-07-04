import { createStore } from 'redux';

const initialState = {
        response: null,
        error: null,
        isLoading: false,
    
}

const rootReducer = (state = initialState, action) => {
    switch(action.type) {
        case 'FETCH_ORDER_BOOK': 
            return {
                ...state,
                response: null,
                error: null,
                isLoading: true,
            }
        case 'FETCH_ORDER_BOOK_SUCCESS': 
        return {
            ...state,
            response: action.payload,
            error: null,
            isLoading: false,
        }
        case 'FETCH_ORDER_BOOK_ERROR': 
        return {
            ...state,
            response: null,
            error: action.payload,
            isLoading: false,
        }
        default: 
        return state;
    }

}

export default createStore(rootReducer);