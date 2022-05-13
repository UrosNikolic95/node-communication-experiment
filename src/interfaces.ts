export interface IpRequest {
  id: number;
  ip: string;
  port?: number;
}
export interface IpRequestCollection {
  [key: string]: IpRequest;
}
