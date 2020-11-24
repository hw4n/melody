import logo from './logo.svg';
import './App.css';
import Queue from './components/Queue';
import Playing from './components/Playing';

function App() {
  return (
    <div className="App">
      <audio controls>
        <source src="/stream" type="audio/mpeg"/>
      </audio>
      <Playing/>
      <Queue/>
    </div>
  );
}

export default App;
