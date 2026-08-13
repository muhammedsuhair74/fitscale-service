import { randomUUID } from "node:crypto";
import { IdGenerator } from "./idGenerator";

export default class UUIDGenerator implements IdGenerator {
  generate(): string {
    return randomUUID();
  }
}
