import logo from './logo.svg';
import React, { useState, useEffect } from 'react';
import Atlas from './components/Atlas';
import SearchBar from './components/SearchBar'
import './App.css';

function App() {
  const [instaData, setInstaData] = useState([])

  return (
    <div className="App">
      <SearchBar setInstaData={setInstaData} />
      <Atlas instaData={instaData}/>
    </div>
  );
}

export default App;
