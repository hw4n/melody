import React from 'react'
import { useSelector } from 'react-redux';
import { setEditing } from '../helper/app';
import { secondsToHourlyTimestamp } from '../helper/format';

function LyricEditor(props) {
  const { start } = useSelector(store => store.socket);
  const { saveLyrics, lyrics, textareaRef } = props;
  return (
    <textarea class="lyricsEditor" onKeyDown={(e) => {
      if (e.key === "Tab") {
        e.preventDefault();
        e.target.value += "\t";
      }
      if (e.key === "Escape") {
        setEditing(false);
      }
      if (e.ctrlKey && (e.key === "s" || e.key === "S")) {
        e.preventDefault();
        saveLyrics();
        setEditing(false);
      }
      if (e.key === "F1") {
        const deltaSecond = (Date.now() - start) / 1000;
        const timestamp = `\n[${secondsToHourlyTimestamp(deltaSecond)}]\n`;
        // using execCommand to preserve undo/redo stack
        // eslint-disable-next-line no-unused-expressions
        document.execCommand("insertText", false, timestamp);
      }
    }} defaultValue={lyrics} ref={textareaRef} autoFocus/>
  )
}

export default LyricEditor
