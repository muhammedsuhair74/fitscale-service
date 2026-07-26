import { EventTypes } from "./constants";

export type EventType = (typeof EventTypes)[keyof typeof EventTypes];
