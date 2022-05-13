console.log("client started");

import { io, Socket } from "socket.io-client";

import * as dns from "dns";
import * as os from "os";
import {
  event1,
  startCount,
  plusOne,
  pingKey,
  getIps,
  sendIp,
  my_id,
  IpRequest,
  sendPort,
  directPing,
} from "./consts";
import { Server } from "socket.io";

function getMyIp() {
  return new Promise((res) =>
    dns.lookup(os.hostname(), (...args) => res(args[1]))
  );
}

const connectionsData = {} as { [key: string]: IpRequest };
const sockets = {} as { [key: string]: Socket };

const server_socket = new Server({ transports: ["websocket"] });
server_socket.on("connection", (socket) => {
  socket.on(directPing, (other_id) => console.log(my_id, other_id));
});
const client = io("ws://127.0.0.1:3000", {
  transports: ["websocket"],
  reconnectionAttempts: 20,
  reconnectionDelay: 1000,
  timeout: 10000,
});

client.on(event1, (other_id) => console.log(my_id, other_id));
client.on(startCount, () => client.emit(plusOne, my_id));
client.on(getIps, async () =>
  client.emit(sendIp, { id: my_id, ip: await getMyIp() } as IpRequest)
);
client.on(sendPort, (data: IpRequest) => {
  connectionsData[data.id] = data;
  if (my_id == data.id && data.port) {
    server_socket.listen(data.port);
    console.log(data.port);
  }

  sockets[data.id] = io("ws://" + data.ip + ":" + data.port, {
    transports: ["websocket"],
    reconnectionAttempts: 20,
    reconnectionDelay: 1000,
    timeout: 10000,
  });
});
setTimeout(() => {
  console.log(connectionsData);
  Object.values(sockets).forEach((socket) => {
    console.log(my_id, socket.connected);
    socket.emit(directPing, my_id);
  });
}, 10000);

export function sleep(miliseconds: number) {
  return new Promise((res) => setInterval(res, miliseconds));
}

export function ping(timeout: number): Promise<boolean> {
  return Promise.race([
    new Promise<boolean>((res) => client.emit(pingKey, res)),
    new Promise<boolean>((res) => setTimeout(() => res(false), timeout)),
  ]);
}
