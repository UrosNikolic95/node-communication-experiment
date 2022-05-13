export const pingKey = "pingKey";
export const event1 = "event1";
export const startCount = "startCount";
export const plusOne = "plusOne";
export const getIps = "getIps";
export const sendIp = "sendIp";
export const sendPort = "sendPort";
export const directPing = "directPing";
export const port = 3000;
export const my_id = Number(process.env.pm_id);
export interface IpRequest {
  id: number;
  ip: string;
  port?: number;
}
