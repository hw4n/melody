import { useEffect, useState } from "react";
import axios from "axios";

function Playing() {
  const [playing, setPlaying] = useState({});

  useEffect(() => {
    const fetchPlaying = async() => {
      const result = await axios(
        "/nowplaying"
      );
  
      setPlaying(result.data);
    };

    fetchPlaying();
  }, []);

  return (
    <div className="queue">
      Current song is : {playing.title}
    </div>
  );
}

export default Playing;
