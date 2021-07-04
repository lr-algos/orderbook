import React, { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { fetchOrderBook, fetchOrderBookSuccess, fetchOrderBookError } from './store/actions';
import { useMediaQuery } from 'react-responsive';
import ccxt from 'ccxt';
import './App.css';


const OrderBook = (props) => {
  

  const [startFeed, setStartFeed] = useState(false);
  const [productId, setProductId] = useState('PI_XBTUSD');
  const [shouldUnsubscribe, setShouldUnsubscribe] = useState(false);
  const [level, setLevel] = useState();
  const [bidList, setBidList] = useState();
  const [askList, setAskList] = useState();

  const isTabletOrMobile = useMediaQuery({ query: '(max-width: 1224px)' });

  const ws = useRef(null);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchOrderBook());
    ws.current = new WebSocket('wss://www.cryptofacilities.com/ws/v1');
    ws.current.onopen = () => {
      const subscribe = {
        event:"subscribe",
        feed:`book_ui_1`,
        product_ids:[productId]
      }
      ws.current.send(JSON.stringify(subscribe));
    };
    ws.current.onclose = () => {
      ws.current.close()
    };

    ws.current.onerror = (event) => {
      dispatch(fetchOrderBookError({message: 'Please refresh the page to see the Order Book'}))
    }

    return () => {
        console.log('___ closed ________')
        ws.current.close();
    };
}, [dispatch, productId]);
  

  const getSortedList = (map) => {
    const sortedList = Array.from(map).sort((a,b) => a[0] - b[0]);
    sortedList.map((item, index) => {
      const total = (index === 0) ? item[1] : sortedList[index - 1][2] + item[1];
      return item.push(total);
    });
    return sortedList;
  }

  

  useEffect(() => {

    const bidsMap = new Map();
    const asksMap = new Map();

    const updateSortedList = (type, allData, map) => {
      allData?.forEach(item => {
        if(item[1] === 0) {
          map.delete(item[0]);
        } else if(item[1] !== 0) {
          const precision = props.groupOrder[0].label;
          
          let price = item[0]
          if (precision !== undefined) {
              price = ccxt.decimalToPrecision (price, ccxt.ROUND, precision, ccxt.TICK_SIZE)
          }
          map.set(price, item[1]);
        }
        if(type === 'bid') {
          setBidList(getSortedList(map))
        } else {
          setAskList(getSortedList(map))
        }
      })
    }

    ws.current.onmessage = (event) => {
      
      if (startFeed || shouldUnsubscribe) return;
      const response = JSON.parse(event?.data);
      dispatch(fetchOrderBookSuccess(response));
    
      if(response.feed === 'book_ui_1_snapshot') {
        setLevel(response.numLevels);
        response?.bids.forEach(bid => {

          bidsMap.set(bid[0], bid[1]);
        });

        response?.asks.forEach(ask => {
          asksMap.set(ask[0], ask[1]);
        });

        setBidList(getSortedList(bidsMap));

        setAskList(getSortedList(asksMap))
        
      } else {
          const allBids = response?.bids;
          const allAsks = response?.asks;

          response?.bids?.forEach((bid, index) => {
            if(index >= 0 && index <= 25) {
              console.log(index, bid[0], bid[1])
            }
            
          })

          updateSortedList('bid', allBids, bidsMap);
          updateSortedList('ask', allAsks, asksMap);
      }
    };
  }, [startFeed, shouldUnsubscribe, props.groupOrder, dispatch]);


  useEffect(() => {

    if(!shouldUnsubscribe) {
      return;
    }
    dispatch(fetchOrderBook());
    ws.current = new WebSocket('wss://www.cryptofacilities.com/ws/v1');

      ws.current.onopen = () => {

        const unsubscribe = {
          event:"unsubscribe",
          feed:`book_ui_1`,
          product_ids:[productId]
        }
      
        ws.current.send(JSON.stringify(unsubscribe));

        const prodId = productId === "PI_XBTUSD" ? "PI_ETHUSD" : "PI_XBTUSD";
        const subscribe = {
          event:"subscribe",
          feed:`book_ui_1`,
          product_ids:[prodId]
        }
        ws.current.send(JSON.stringify(subscribe));
      };
      if(productId === "PI_XBTUSD") {
        setProductId("PI_ETHUSD")
      } else {
        setProductId("PI_XBTUSD")
      }
      setShouldUnsubscribe(false);
}, [shouldUnsubscribe, dispatch, productId]);

  const orderRows = (arr, type) =>
    arr &&
    arr.map((item, index) => {
      return(
      <tr key={index}>
        {type === 'buy'? <td> {item && item[2]} </td> : <td className="sell-price"> {item && item[0]} </td>}
        <td> {item && item[1]} </td>
        {type === 'buy' ? <td className="buy-price"> {item && item[0]} </td> : <td> {item && item[2]} </td>}
      </tr>
    )});
  const orderHead = (title) => (
    <thead>
      <tr>
        <th colSpan="3" className="head-text">{title}</th>  
      </tr>
      <tr>
        {title === 'Buy' ? <th className="head-text">TOTAL</th> : <th className="head-text">PRICE</th>}
        <th className="head-text">SIZE</th>
        {title === 'Buy' ? <th className="head-text">PRICE</th> : <th className="head-text">TOTAL</th>}
      </tr>
    </thead>
  );

  return (
    <div className="main-container">
      <div className="order-container" style={{flexDirection: isTabletOrMobile ? 'column' : 'row' }}>
        <table>
          {orderHead('Buy')}
          <tbody>{orderRows(bidList?.slice(0, level), 'buy')}</tbody>
        </table>
        <hr className="hr-border" />
        <table>
          {orderHead('Sell')}
          <tbody>{orderRows(askList?.slice(0, level), 'sell')}</tbody>
        </table>
      </div>
      <div className="button-main">
      <div className="button-container">
        <button className="toggle-button" onClick={() => setShouldUnsubscribe(true)}>
          Toggle Feed
        </button>
        <div className="button-divider" />
        <button onClick={() => setStartFeed(!startFeed)} className="kill-button" style={{ backgroundColor: startFeed ? 'green': 'red'}}>
          {startFeed ? 'Start Feed' : 'Kill Feed'}
        </button>
      </div>
    </div>
  </div>
  );
};

export default OrderBook;