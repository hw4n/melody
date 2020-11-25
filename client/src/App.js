import logo from './logo.svg';
import './App.css';
import io from "socket.io-client";
import { useEffect, useState } from 'react';

let SOCKET_URI = "/"
if (process.env.NODE_ENV === "development") {
  SOCKET_URI = "http://localhost:3333";
}

const socket = io.connect(SOCKET_URI);

function App() {
  const [queue, setQueue] = useState([]);
  const [played, setPlayed] = useState([]);
  const [playing, setPlaying] = useState({});

  useEffect(() => {
    socket.on('data', (msg) => {
      setQueue(msg.queue);
      setPlayed(msg.played);
      setPlaying(msg.playing);
    });
  });

  return (
    <div className="App">
      <audio controls>
        <source src="/stream" type="audio/mpeg"/>
      </audio>
      <h1>Current song is : {playing.title}</h1>
      {queue.map(song => {
        return (
          <li>{song}</li>
        )
      })}
      <hr/>
      {played.map(song => {
        return (
          <li>{song}</li>
        )
      })}
    </div>
  );
}

export default App;
