export enum EventType {}

export class Eventor {
  constructor(private win: Window) {}
  on(type: EventType) {}
  send(type: EventType, data: any) {}
}
