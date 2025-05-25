import cron from "node-cron";
import userModel from "../models/userModel.js";
import transporter from "../config/nodemailer.js";

export default function startAccountDeletion() {
  // Production: Run every hour
  cron.schedule("* * * * *", async () => {
    const now = new Date();
    try {
      const usersToDelete = await userModel.find({
        "deletionSchedule.isScheduled": true,
        "deletionSchedule.scheduledAt": { $lte: now },
      });

      if (usersToDelete.length > 0) {
        const deletedUsers = [];
        for (let user of usersToDelete) {
          try {
            const userDetails = {
              username: user.username,
              email: user.email,
              name: user.name,
              deletedAt: new Date().toISOString(),
            };
            await userModel.findByIdAndDelete(user._id);
            deletedUsers.push(userDetails);
          } catch (deleteError) {
            console.error(
              `[Account Deletion] Error deleting user ${user.username}:`,
              deleteError
            );
          }
        }
        if (deletedUsers.length > 0) {
          const mailOptions = {
            from: `"SnapLink" <${process.env.SENDER_EMAIL}>`,
            to: process.env.ADMIN_EMAIL,
            subject: "Account Deletion Report",
            html: `
              <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2>Account Deletion Report</h2>
                <p>The following accounts were deleted on ${new Date().toLocaleString()}:</p>
                <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                  <thead>
                    <tr style="background-color: #f2f2f2;">
                      <th style="padding: 12px; border: 1px solid #ddd;">Username</th>
                      <th style="padding: 12px; border: 1px solid #ddd;">Name</th>
                      <th style="padding: 12px; border: 1px solid #ddd;">Email</th>
                      <th style="padding: 12px; border: 1px solid #ddd;">Deleted At</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${deletedUsers
                      .map(
                        (user) => `
                      <tr>
                        <td style="padding: 12px; border: 1px solid #ddd;">${
                          user.username
                        }</td>
                        <td style="padding: 12px; border: 1px solid #ddd;">${
                          user.name
                        }</td>
                        <td style="padding: 12px; border: 1px solid #ddd;">${
                          user.email
                        }</td>
                        <td style="padding: 12px; border: 1px solid #ddd;">${new Date(
                          user.deletedAt
                        ).toLocaleString()}</td>
                      </tr>
                    `
                      )
                      .join("")}
                  </tbody>
                </table>
                <p style="margin-top: 20px;">Total accounts deleted: ${
                  deletedUsers.length
                }</p>
                <br />
                <p>Best regards,</p>
                <p><strong>SnapLink Team</strong></p>
              </div>
            `,
          };
          try {
            await transporter.sendMail(mailOptions);
            console.log(
              "[Account Deletion] Deletion report email sent successfully"
            );
          } catch (emailError) {
            console.error(
              "[Account Deletion] Error sending deletion report email:",
              emailError
            );
          }
        }
      }
    } catch (error) {
      console.error(
        "[Account Deletion] Error during scheduled user deletion:",
        error
      );
    }
  });

  // Initial startup log
  userModel
    .countDocuments({ "deletionSchedule.isScheduled": true })
    .then((count) => {
      console.log(
        `[Account Deletion] Initial count of scheduled users: ${count}`
      );
      console.log(
        "[Account Deletion] Cron job started successfully - Running every hour"
      );
    })
    .catch((error) => {
      console.error("[Account Deletion] Error getting initial count:", error);
      console.log(
        "[Account Deletion] Cron job started successfully - Running every hour"
      );
    });
}
