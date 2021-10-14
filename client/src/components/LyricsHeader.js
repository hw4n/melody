import React from 'react'
import { faEdit, faSave } from '@fortawesome/free-solid-svg-icons';
import { faSquare, faCheckSquare } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function LyricsHeader(props) {
  const { title, editing, synced, setSynced, saveLyrics, setEditing} = props;

  return (
    <div class="lyricsHeaderWrap">
      <div class="lyricsHeaderLeft"></div>
      <div class="lyricsHeaderMiddle">{title}</div>
      <div class="lyricsHeaderRight">
        { editing ? (
          <>
            <button onClick={() => {
              setSynced(!synced);
            }} class="in-progress">
              { synced ? (
                <FontAwesomeIcon icon={faCheckSquare} size="2x"/>
              ) : (
                <FontAwesomeIcon icon={faSquare} size="2x"/>
              )}
              <span>Synced Lyric</span>
            </button>
            <button onClick={() => {
              saveLyrics();
              setEditing(false);
            }} class="in-progress">
              <FontAwesomeIcon icon={faSave} size="2x"/>
              <span>Save lyrics</span>
            </button>
          </>
        ) : (
          <button onClick={() => {
            setEditing(!editing);
          }}>
            <FontAwesomeIcon icon={faEdit} size="2x"/>
            <span>Edit lyrics</span>
          </button>
        )}
      </div>
    </div>
  )
}

export default LyricsHeader
