import { useState, useEffect } from 'react';
import './Lyrics.css';
import Loader from './Loader';

function Lyrics(props) {
  const { title } = props.playing;
  const [loading, setLoading] = useState(true);
  const [lyrics, setLyrics] = useState('');

  useEffect(() => {
    setLyrics(`${title}<hr>`);
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
        lyrics.length ? (
          <div
            class="lyrics"
            dangerouslySetInnerHTML={{__html: removeFormats(lyrics)}}
          />
        ) : (
          <div class="lyrics">No lyrics yet</div>
        )
      )}
    </div>
  );
}

export default Lyrics;
