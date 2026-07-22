import { Prisma } from "@prisma/client";
import { createEventRepository } from "./outbox.repository";
import { DomainEvent } from "./outbox.types";

export const saveEventRepository = async (
  tx: Prisma.TransactionClient,
  event: DomainEvent<unknown>,
) => {
  try {
    const result = await createEventRepository(tx, event);

    return { success: true, data: event };
  } catch (error) {
    throw error;
  }
};

// export const createEventService = async (event: any) => {
//   const events = await Event.findAll();
//   return events;
// };
