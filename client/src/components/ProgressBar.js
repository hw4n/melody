import { useState, useEffect } from 'react';
import './ProgressBar.css';
import { useSelector } from 'react-redux';

function secondsToTimestring(x) {
  const m = Math.floor(x / 60);
  const s = Math.floor(x % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function ProgressBar(props) {
  const { start, playing: {duration} = {} } = useSelector(store => store.socket);
  const { displayTime=true, noRadius=false, updateMS=1000 } = props;
  const [ currentTime, setCurrentTime ] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), updateMS);
    return () => {
      clearInterval(interval);
    };
  }, [updateMS]);

  let currentProgress = (currentTime - start) / 1000;
  const progressPercent = currentProgress / duration * 100;
  if (progressPercent < 0) {
    currentProgress = 0;
  } else if (progressPercent > 100) {
    currentProgress = duration;
  }

  return (
    <div className="progressWrap">
      { displayTime ? (
        <div className="time current">{secondsToTimestring(currentProgress)}</div>
      ) : (
        <></>
      )}
      <div className={noRadius ? "progressBar noRadius" : "progressBar"}>
        <div className={noRadius ? "progressBarCurrent noRadius" : "progressBarCurrent"} style={{width: `${progressPercent}%`}}></div>
      </div>
      { displayTime ? (
        <div className="time end">{secondsToTimestring(duration)}</div>
      ) : (
        <></>
      )}
    </div>
  );
}

export default ProgressBar;
