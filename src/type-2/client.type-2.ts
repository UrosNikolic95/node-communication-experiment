import { createServer } from "http";
import { Server } from "socket.io";
import { io, Socket } from "socket.io-client";
import { my_id, port, sendIp, sendPort, shareData } from "../consts";
import { getMyIp, sleep } from "../helpers";
import { IpRequest } from "../interfaces";

const getOtherIdKey = "getOtherId";
const milliseconds_per_second = 1000;
const connectionsData = {} as { [key: string]: IpRequest };
const nonReactiveBasket = {} as { [key: string]: any };
const sockets = {} as { [key: string]: Socket };

let counter = 1;

const server = createServer();
const coordinatorServer = new Server(server, { transports: ["websocket"] });
const myServer = new Server({ transports: ["websocket"] });
myServer.on("connection", (socket) => {
  socket.on(
    shareData,
    (property, value) => (nonReactiveBasket[property] = value)
  );
});

const coordinatorClient = io("http://localhost:3000", {
  transports: ["websocket"],
  reconnectionAttempts: 5,
  reconnectionDelay: milliseconds_per_second,
});

coordinatorClient.on("connect", async () => {
  coordinatorClient.emit(sendIp, {
    id: my_id,
    ip: await getMyIp(),
  } as IpRequest);
});

function processData(data: IpRequest) {
  connectionsData[data.id] = data;
  if (my_id == data.id && data.port) {
    myServer.listen(data.port);
  }

  sockets[data.id] = io("ws://" + data.ip + ":" + data.port, {
    transports: ["websocket"],
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    timeout: 10000,
  });
}

coordinatorClient.on(sendPort, (data: IpRequest | IpRequest[]) => {
  if (Array.isArray(data)) {
    data.forEach((item) => processData(item));
  } else {
    processData(data);
  }
});

async function main() {
  console.log("main", my_id);
  await sleep(my_id * milliseconds_per_second);
  coordinatorServer.on("connection", (socket) => {
    socket.on(getOtherIdKey, (callback) => {
      callback(my_id);
    });
    socket.on(sendIp, (data: IpRequest) => {
      connectionsData[data.id] = data;
      data.port = port + counter++;
      socket.broadcast.emit(sendPort, data);
      socket.emit(sendPort, Object.values(connectionsData));
    });
  });

  const other_id = await getOtherId();
  if (other_id == -1) {
    coordinatorServer.listen(3000);
  }

  console.log(">>>>>", "me", my_id, "other", other_id);
}
main();

function getOtherId() {
  return Promise.race([
    new Promise((res) => coordinatorClient.emit(getOtherIdKey, res)),
    new Promise((res) => setInterval(() => res(-1), 500)),
  ]);
}

export const reactiveBasket = new Proxy(nonReactiveBasket, {
  set(target, property: string, value) {
    target[property] = value;
    Object.values(sockets).forEach((socket) =>
      socket.emit(shareData, property, value)
    );
    return true;
  },
});
