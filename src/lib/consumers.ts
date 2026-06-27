import { startTotalWorkoutsConsumer } from "./total-workout.consumer";
import { startBadgeWorker } from "./workers/badge.worker";

const startConsumers = () => {
  startTotalWorkoutsConsumer();
  startBadgeWorker();
};

export default startConsumers;
