import './App.css';
import { useEffect, useState } from 'react';
import Loader from "./components/Loader";
import Flash from "./components/Flash";
import Lyrics from "./components/Lyrics";
import EntirePlaylist from "./components/EntirePlaylist";
import Footer from "./components/Footer";
import { useSelector } from 'react-redux';
import { setDocumentTitle, setKeydownListeners, setMediaSession, setUnloadEvent } from './helper/app';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';

const DEFAULT_TITLE = process.env.TITLE || "Melody";

function App() {
  const [loaderMounted, setLoaderMounted] = useState(true);
  const { playing, queue } = useSelector(store => store.socket);
  const { isPlaying, isLyricMode } = useSelector(store => store.app);

  useEffect(() => {
    setKeydownListeners(document);
    setUnloadEvent(window);
  }, []);

  // change document.title to current music title
  useEffect(() => {
    setDocumentTitle(document, isPlaying ? `♪ Playing ${playing.title}` : DEFAULT_TITLE);
    setMediaSession(window);
  }, [isPlaying, playing.title]);

  return (
    <Router>
      { loaderMounted ? (
        <Loader ready={queue.length ? true : playing} unmounter={setLoaderMounted}/>
      ) : <></> }
      <Flash/>
      { isLyricMode ? <Redirect to="/lyrics" /> : <Redirect to="/"/> }
      <Switch>
        <Route exact path="/lyrics">
          <Lyrics/>
        </Route>
        <Route exact path="/">
          <EntirePlaylist/>
        </Route>
      </Switch>
      <Footer/>
    </Router>
  );
}

export default App;
