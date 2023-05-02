import logo from './logo.svg';
import './App.css';
// import MeditrakkerMap from './components/map';
// import FromScratchMap from './components/mapFromScratch';
import TrailGroupInfo from './pages/trek/information';
import Live from './pages/live/live';

function App() {
  return (
    <div className="App">
      {/* {<header className="App-header">
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
      </header>} */}
      {/* { <TrailGroupInfo infos={{distance: 10, speed: 20, time: 30}} improvement={{distance: 9, speed: 4, time: 2}} /> } */}
      
      <Live />
      
      {/*<MeditrakkerMap center_lat={45.39701} center_lon={6.58968} zoom={13} />*/}
      {/* <FromScratchMap center_lat={45.39701} center_lon={6.58968} zoom={13} /> */}
      
    </div>
  );
}

export default App;
