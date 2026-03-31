import dns from "dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);
import connectDB from "./db/index.js";
import { app } from "./app.js";
import "dotenv/config";
import { scheduleContractExpiryJob, updateContractStatuses } from "./crons/contactExpiry.cron.js";

connectDB()
  .then(async () => {

    await updateContractStatuses();

    // Schedule daily midnight job
    scheduleContractExpiryJob();

    // For Unexpected erros
    app.on("error", (error) => {
      console.log(
        "Server is not running at the PORT, Please check you PORT.",
        error
      );
      throw error;
    });
    // Start Server
    app.listen(process.env.PORT || 4000, () => {
      console.log(`🚀 Server is running at PORT : ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log("❌ MongoDB connnetion Failed", error);
  });
