import logo from './logo.svg';
import './App.css';
import MeditrakkerMap from './components/map';
import FromScratchMap from './components/mapFromScratch';

function App() {
  return (
    <div className="App">
      {/* <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header> */}
      {/* <h1>Testos</h1> */}
      {/*<MeditrakkerMap center_lat={45.39701} center_lon={6.58968} zoom={13} />*/}
      <FromScratchMap center_lat={45.39701} center_lon={6.58968} zoom={13} />
      
    </div>
  );
}

export default App;
