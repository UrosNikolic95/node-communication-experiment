import { Server } from "socket.io";
import {
  event1,
  pingKey,
  plusOne,
  sendIp,
  IpRequest,
  port,
  sendPort,
  startCount,
  getIps,
} from "./consts";

console.log("coordinator started");

const server_socket = new Server({ transports: ["websocket"] });

let counter = 1;
const set = new Set<number>();
async function main() {
  server_socket.on("connection", (socket) => {
    socket.on(event1, (data) => {
      server_socket.emit(event1, data);
    });
    socket.on(pingKey, (callback) => {
      callback(true);
    });
    socket.on(plusOne, (other_id) => {
      set.add(other_id);
    });
    socket.on(sendIp, (data: IpRequest) => {
      data.port = port + counter++;
      server_socket.emit(sendPort, data);
    });
  });
  setInterval(() => {
    set.clear();
    server_socket.emit(startCount);
    setTimeout(() => console.log("set", set.size, Array.from(set)), 1000);
  }, 5000);
  setTimeout(() => {
    server_socket.emit(getIps);
  }, 5000);

  server_socket.listen(port);
}

main();
