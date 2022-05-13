console.log("client started");

import { io, Socket } from "socket.io-client";

import { sendIp, my_id, sendPort, directPing } from "./consts";
import { Server } from "socket.io";
import { IpRequest } from "./interfaces";
import { getMyIp } from "./helpers";

const connectionsData = {} as { [key: string]: IpRequest };
const sockets = {} as { [key: string]: Socket };

const myServer = new Server({ transports: ["websocket"] });

const coordinatorClient = io("ws://127.0.0.1:3000", {
  transports: ["websocket"],
  reconnectionAttempts: 20,
  reconnectionDelay: 1000,
  timeout: 10000,
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
