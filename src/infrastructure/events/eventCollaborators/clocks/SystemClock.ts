import { Clock } from "./Clock";

export default class SystemClock implements Clock {
  now(): Date {
    return new Date();
  }
}
