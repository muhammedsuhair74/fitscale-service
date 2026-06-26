import { startTotalWorkoutsConsumer } from "./modules/total-workouts/total-workouts.consumers";
import { startBadgeWorker } from "./modules/badge/workers/badge.worker";

const consumersExecuter = () => {
  startTotalWorkoutsConsumer();
  startBadgeWorker();
};

export default consumersExecuter;
