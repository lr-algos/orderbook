import React, { useState } from 'react';
import OrderBook from './OrderBook';
import ClipLoader from "react-spinners/ClipLoader";
import { useSelector } from 'react-redux';
import GroupOrder from './GroupOrder';
import './App.css';


const App = () => {
  const options = [{'label' : 0.5}, {'label' : 1}, {'label' : 2.5}];
  const [value, setValue] = useState([{'label' : 0.5}])
  const orderbook = useSelector(state => state);
  const handleGroupChange = (value) => {
    setValue(value)
  }
  return (
    <div>
      <div className="main-title">
        <h3 className="text-color">Order Book </h3>
        <GroupOrder
          options={options}
          value={value}
          onChangeGroup={handleGroupChange}
        />
      </div>
     { orderbook.isLoading && <div className="loading-container">
      <ClipLoader color='white' loading={orderbook.isLoading === true}   size={150} />
      </div>}
      {orderbook.error && <div><h2 className="text-color">{orderbook.error.message}</h2></div>}
     {!orderbook.error &&
     <div>
       <hr className="horizontal-divider" />
       <OrderBook
          groupOrder={value}
       />
     </div>
      
      }
    </div>
  )
}

export default App;