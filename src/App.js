import logo from './logo.svg';
import Atlas from './components/Atlas';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
      </header>
      <Atlas />
    </div>
  );
}

export default App;
