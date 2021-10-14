import React from 'react'

function LyricEditor(props) {
  const { setEditing, saveLyrics, lyrics, textareaRef } = props;
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
    }} defaultValue={lyrics} ref={textareaRef} autoFocus/>
  )
}

export default LyricEditor
