import { getChannel } from "./rabbitmq";

const bindQueuesToExchange = async ({
  arrayOfQueues,
  exchange,
}: {
  arrayOfQueues: string[];
  exchange: string;
}) => {
  const channel = getChannel();
  await Promise.all(
    arrayOfQueues.map(async (queue) => {
      await channel.bindQueue(queue, exchange, "");
    }),
  );
};

export default bindQueuesToExchange;
