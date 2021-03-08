import { useState, useEffect } from 'react';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
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
        let lyricsToAppend = 'No lyrics yet';
        if (data.lyrics) {
          lyricsToAppend = data.lyrics;
        }
        setLyrics(lyrics => lyrics + lyricsToAppend);
        setLoading(false);
      });
  }, [title]);

  function removeFormats(string) {
    return string
      .replace(/\[\d+\]/g, "")
      .replace(/ +href=\S+"/g, "")
      .replace(/<del>.+<\/del>/g, "");
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
            <button onClick={() => {
              setEditing(!editing);
            }} class={editing ? "in-progress" : ""}>
              <FontAwesomeIcon icon={faEdit} size="2x"/>
              <span>Edit lyrics</span>
            </button>
          </div>
        </div>
        <div
          class="lyrics"
          dangerouslySetInnerHTML={{__html: removeFormats(lyrics)}}
        /></>
      )}
    </div>
  );
}

export default Lyrics;
