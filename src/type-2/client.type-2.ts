import { createServer } from "http";
import { Server } from "socket.io";
import { io } from "socket.io-client";

const getOtherIdKey = "getOtherId";
const milliseconds_per_second = 1000;

const server = createServer();
const client_connections = new Server(server, { transports: ["websocket"] });
const server_connection = io("http://localhost:3000", {
  transports: ["websocket"],
  reconnectionAttempts: 5,
  reconnectionDelay: milliseconds_per_second,
});
const my_id = Number(process.env.pm_id);

async function main() {
  console.log("main", my_id);
  await sleep(my_id * milliseconds_per_second);
  client_connections.on("connection", (socket) => {
    socket.on(getOtherIdKey, (callback) => {
      callback(my_id);
    });
    socket.on("message", (message) => {
      client_connections.emit("message", message);
    });
  });

  const other_id = await getOtherId();
  if (other_id == -1) {
    client_connections.listen(3000);
  }

  console.log(">>>>>", "me", my_id, "other", other_id);
}
main();

function sleep(miliseconds: number) {
  return new Promise((res) => setTimeout(res, miliseconds));
}

function getOtherId() {
  return Promise.race([
    new Promise((res) => server_connection.emit(getOtherIdKey, res)),
    new Promise((res) => setInterval(() => res(-1), 500)),
  ]);
}

function sendToAll(message: any) {
  server_connection.emit("message", message);
}

function recieveFromAll(func: (data: any) => void) {
  server_connection.on("message", func);
}
