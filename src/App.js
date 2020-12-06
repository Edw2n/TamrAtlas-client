import logo from './logo.svg';
import React, { useState, useEffect } from 'react';
import Atlas from './components/Atlas';
import SearchBar from './components/SearchBar'
import BrushableBar from './components/BrushableBar'
import './App.css';

function App() {
  const [items, setItems] = useState([])
  const [negItems, setNegItems] = useState([])
  const [barData, setBarData] = useState([])
  const [barDataReady, setBarDataReady] = useState(false)
  
  useEffect(() => {
    setBarDataReady(false);
    let data = []

    // dummy color
    let color = ['#E37567', '#C2D15B', '#3A5487']

    // dummy data
    for (let i = 0; i < 12 * 3; i++) {
      let datum = {};
      datum.date = i + 1;
      datum.value = Math.floor(Math.random() * 100);
      datum.color = color[i % 3]
      data.push(datum);
    }

    setBarData(data);
    setBarDataReady(true);
  }, [])
  
  return (
    <div className="App">
      {barDataReady ? <BrushableBar data={barData}/> : null}
      <SearchBar items={items} setItems={setItems} negItems={negItems} setNegItems={setNegItems}/>
      <Atlas />
    </div>
  );
}

export default App;
