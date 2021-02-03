import { useState, useEffect } from 'react';
import './ProgressBar.css';

function secondsToTimestring(x) {
  const m = Math.floor(x / 60);
  const s = Math.floor(x % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function ProgressBar(props) {
  const { playbackStart, duration } = props;
  const [ currentTime, setCurrentTime ] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  let currentProgress = (currentTime - playbackStart) / 1000;
  const progressPercent = currentProgress / duration * 100;
  if (progressPercent < 0) {
    currentProgress = 0;
  } else if (progressPercent > 100) {
    currentProgress = duration;
  }

  return (
    <div class="progressWrap">
      <div class="time current">{secondsToTimestring(currentProgress)}</div>
      <div class="progressBar">
        <div class="progressBarCurrent" style={{width: `${progressPercent}%`}}></div>
      </div>
      <div class="time end">{secondsToTimestring(duration)}</div>
    </div>
  );
}

export default ProgressBar;
