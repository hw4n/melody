import { useState, useEffect } from 'react';
import { faEdit, faSave } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import './Lyrics.css';
import Loader from './Loader';

function Lyrics(props) {
  const { title } = props.playing;
  const [loading, setLoading] = useState(true);
  const [lyrics, setLyrics] = useState('');
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    setLyrics('');
    fetch('/lyrics')
      .then((res) => res.json())
      .then((data) => {
        if (data.lyrics) {
          setLyrics(() => data.lyrics);
        }
        setLoading(false);
      });
  }, [title]);

  function createLyrics(string) {
    if (string.length) {
      return string
        .replace(/\[\d+\]/g, "")
        .replace(/ +href=\S+"/g, "")
        .replace(/<del>.+<\/del>/g, "");
    }
    return "No lyrics yet, add the lyrics!";
  }

  return (
    <div class="lyricsWrap">
      { loading ? (
        <Loader transparent={true}/>
      ) : (
        <>
        <div class="lyricsHeaderWrap">
          <div class="lyricsHeaderLeft"></div>
          <div class="lyricsHeaderMiddle">{title}</div>
          <div class="lyricsHeaderRight">
            { editing ? (
              <button onClick={() => {
                setEditing(false);
              }} class="in-progress">
                <FontAwesomeIcon icon={faSave} size="2x"/>
                <span>Save lyrics</span>
              </button>
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
        { editing ? (
          <textarea class="lyricsEditor" onKeyDown={(e) => {
            if (e.key === "Tab") {
              e.preventDefault();
              e.target.value += "\t";
            }
          }} defaultValue={lyrics}/>
        ) : (
          <div
            class="lyrics"
            dangerouslySetInnerHTML={{__html: createLyrics(lyrics)}}
          />
        )}
        </>
      )}
    </div>
  );
}

export default Lyrics;
