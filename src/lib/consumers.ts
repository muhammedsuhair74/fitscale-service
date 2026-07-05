import { startTotalWorkoutsConsumer } from "../events/consumers/total-workout.consumer";
import { startBadgeWorker } from "../events/consumers/badge.consumer";
import { startNotificationConsumer } from "../events/consumers/notification.consumer";

const startConsumers = () => {
  startTotalWorkoutsConsumer();
  startNotificationConsumer();
  startBadgeWorker();
};

export default startConsumers;
