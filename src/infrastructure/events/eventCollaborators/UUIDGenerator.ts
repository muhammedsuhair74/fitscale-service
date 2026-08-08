import { randomUUID } from "node:crypto";

interface IdGenerator {
  generate(): string;
}

class UUIDGenerator implements IdGenerator {
  generate(): string {
    return randomUUID();
  }
}
