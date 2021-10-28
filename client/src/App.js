import './App.css';
import { useEffect, useState } from 'react';
import Loader from "./components/Loader";
import Flash from "./components/Flash";
import Lyrics from "./components/Lyrics";
import EntirePlaylist from "./components/EntirePlaylist";
import Footer from "./components/Footer";
import { useSelector } from 'react-redux';
import { mode, setDocumentTitle, setKeydownListeners, setMediaSession, setUnloadEvent } from './helper/app';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import Setting from './components/Setting';

const DEFAULT_TITLE = process.env.TITLE || "Melody";

function App() {
  const [loaderMounted, setLoaderMounted] = useState(true);
  const { playing, queue } = useSelector(store => store.socket);
  const { isPlaying, currentMode, isLightTheme } = useSelector(store => store.app);

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
    <div className="App" data-theme={isLightTheme ? "light" : ""}>
      <Router>
        { loaderMounted ? (
          <Loader transparent={true} ready={queue.length ? true : playing} unmounter={setLoaderMounted}/>
        ) : <></> }
        <Flash/>
        {/* there must be a better way of doing this */}
        { currentMode === mode.default ? <Redirect to="/" /> : 
          (currentMode === mode.lyric ? <Redirect to="/lyrics"/> : <Redirect to="/settings"/>) }
        <Switch>
          <Route exact path="/lyrics">
            <Lyrics/>
          </Route>
          <Route exact path="/settings">
            <Setting/>
          </Route>
          <Route exact path="/">
            <EntirePlaylist/>
          </Route>
        </Switch>
        <Footer/>
      </Router>
    </div>
  );
}

export default App;
