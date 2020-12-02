import logo from './logo.svg';
import React, { useState } from 'react';
import Atlas from './components/Atlas';
import SearchBar from './components/SearchBar'
import './App.css';

function App() {
  const [items, setItems] = useState([])
  const [negItems, setNegItems] = useState([])
  return (
    <div className="App">
      <SearchBar items={items} setItems={setItems} negItems={negItems} setNegItems={setNegItems}/>
      <Atlas />
    </div>
  );
}

export default App;
