import { startTotalWorkoutsConsumer } from "../events/consumers/total-workout.consumer";
import { startBadgeWorker } from "../events/consumers/badge.consumer";

const startConsumers = () => {
  startTotalWorkoutsConsumer();
  startBadgeWorker();
};

export default startConsumers;
