export const fetchOrderBook = () => ({
    type: 'FETCH_ORDER_BOOK',
})

export const fetchOrderBookSuccess = (payload) => ({
    type: 'FETCH_ORDER_BOOK_SUCCESS',
    payload: payload,
})

export const fetchOrderBookError = (payload) => ({
    type: 'FETCH_ORDER_BOOK_ERROR',
    payload: payload,
})