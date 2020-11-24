import { useEffect, useState } from "react";
import axios from "axios";

function Queue() {
  const [queue, setQueue] = useState({
    in_queue: [],
    played: [],
  });

  useEffect(() => {
    const fetchQueues = async() => {
      const result = await axios(
        "/queue"
      );
  
      setQueue(result.data);
    };

    fetchQueues();
  }, []);

  return (
    <>
    <ul className="queue">
      {queue.in_queue.map(song => {
        return (
          <li>{song}</li>
        )
      })}
    </ul>
    <ul className="played-queue">
      {queue.played.map(song => {
        return (
          <li>{song}</li>
        )
      })}
    </ul>
    </>
  );
}

export default Queue;
