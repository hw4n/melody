import './Lyrics.css';

function Lyrics(props) {
  const { lyrics } = props;

  function createLyrics(string) {
    if (string !== undefined) {
      return removeFormats(string);
    } else {
      return 'No lyrics yet';
    }
  }

  function removeFormats(string) {
    return string
      .replace(/\[\d+\]/g, "")
      .replace(/ +href=\S+"/g, "")
      .replace(/<del>.+<\/del>/g, "");
  }

  return (
    <div class="lyricsWrap">
      <div
        class="lyrics"
        dangerouslySetInnerHTML={{__html: createLyrics(lyrics)}}
      />
    </div>
  );
}

export default Lyrics;
