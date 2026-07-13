import { OutBoxBody, OutBoxStatusTypes } from "@prisma/client";
import { outBoxRepository } from "../outBox/outBox.repository";

export const createOutBoxService = async (outboxBody: OutBoxBody) => {
  await outBoxRepository.create({
    event: outboxBody.event,
    payload: outboxBody.payload,
    status: OutBoxStatusTypes.QUEUED,
  });
};
