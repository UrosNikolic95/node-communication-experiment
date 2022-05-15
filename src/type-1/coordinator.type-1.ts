import { Server } from "socket.io";
import { sendIp, port, sendPort } from "../consts";
import { IpRequest } from "../interfaces";

console.log("coordinator started");

const connectionsData = {} as { [key: string]: IpRequest };

const coordinatorServer = new Server({ transports: ["websocket"] });

let counter = 1;
async function main() {
  coordinatorServer.on("connection", (socket) => {
    socket.on(sendIp, (data: IpRequest) => {
      connectionsData[data.id] = data;
      data.port = port + counter++;
      socket.broadcast.emit(sendPort, data);
      socket.emit(sendPort, Object.values(connectionsData));
    });
  });
  coordinatorServer.listen(port);
}

main();
