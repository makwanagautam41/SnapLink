import cron from "node-cron";
import userModel from "../models/userModel.js";

cron.schedule("0 * * * *", async () => {
  const now = new Date();

  const usersToDelete = await userModel.find({
    "deletionSchedule.isScheduled": true,
    "deletionSchedule.scheduledAt": { $lte: now },
  });

  for (let user of usersToDelete) {
    await userModel.findByIdAndDelete(user._id);
    console.log(`Deleted user ${user.username} as scheduled.`);
  }
});
