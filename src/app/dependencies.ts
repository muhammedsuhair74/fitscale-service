import { EventFactory } from "../infrastructure/events";
import SystemClock from "../infrastructure/events/eventCollaborators/clocks/SystemClock";
import UUIDGenerator from "../infrastructure/events/eventCollaborators/idGenerator/UUIDGenerator";

export const eventFactory = new EventFactory({
  idGenerator: new UUIDGenerator(),
  clock: new SystemClock(),
});
