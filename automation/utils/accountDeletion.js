import cron from "node-cron";
import userModel from "../models/userModel.js";

export default function startAccountDeletion() {
  cron.schedule("0 * * * *", async () => {
    const now = new Date();

    try {
      const usersToDelete = await userModel.find({
        "deletionSchedule.isScheduled": true,
        "deletionSchedule.scheduledAt": { $lte: now },
      });

      for (let user of usersToDelete) {
        await userModel.findByIdAndDelete(user._id);
        console.log(`Deleted user ${user.username} as scheduled.`);
      }
    } catch (error) {
      console.error("Error during scheduled user deletion:", error);
    }
  });
}
