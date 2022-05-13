import * as dns from "dns";
import * as os from "os";

export function sleep(miliseconds: number) {
  return new Promise((res) => setInterval(res, miliseconds));
}

export function getMyIp() {
  return new Promise((res) =>
    dns.lookup(os.hostname(), (...args) => res(args[1]))
  );
}
