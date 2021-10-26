import { socket } from "../redux/store";

export function requestQueueing(musicId) {
  socket.emit("priority", musicId);
}
