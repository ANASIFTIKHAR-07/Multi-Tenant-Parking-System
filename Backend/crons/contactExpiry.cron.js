import cron from "node-cron";
import { RentalContract } from "../models/rentalContract.model.js";



const updateContractStatuses = async () => {
    const now     = new Date();
    const in30Days = new Date();
    in30Days.setDate(in30Days.getDate() + 30);

    try {
        const expiredResult = await RentalContract.updateMany(
            {
                status:   { $in: ["ACTIVE", "NEAR_EXPIRED"] },
                end_date: { $lte: now },
            },
            { $set: { status: "EXPIRED" } }
        );

        const nearExpiredResult = await RentalContract.updateMany(
            {
                status:   "ACTIVE",
                end_date: { $gt: now, $lte: in30Days },
            },
            { $set: { status: "NEAR_EXPIRED" } }
        );

        console.log(
            `[CRON] Contract statuses updated — ` +
            `Expired: ${expiredResult.modifiedCount}, ` +
            `Near expired: ${nearExpiredResult.modifiedCount}`
        );
    } catch (error) {
        console.error("[CRON] Failed to update contract statuses:", error.message);
    }
};


const scheduleContractExpiryJob = () => {
    cron.schedule("0 0 * * *", async () => {
        console.log("[CRON] Running contract expiry check —", new Date().toISOString());
        await updateContractStatuses();
    });

    console.log("[CRON] Contract expiry job scheduled — runs daily at midnight");
};

export { scheduleContractExpiryJob, updateContractStatuses };