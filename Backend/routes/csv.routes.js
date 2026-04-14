import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/role.middleware.js";
import {
    exportParkingRecords,
    exportTenants,
    exportAccessBadges,
    exportRentalContracts,
} from "../controllers/csv.controller.js";
import { masterImport } from "../controllers/import.controller.js";
import { upload } from "../middlewares/upload.middleware.js";

const router = Router();

// Export routes
router.route("/parking-records").get(verifyJWT, isAdmin, exportParkingRecords);
router.route("/tenants").get(verifyJWT, isAdmin, exportTenants);
router.route("/badges").get(verifyJWT, isAdmin, exportAccessBadges);
router.route("/rental-contracts").get(verifyJWT, isAdmin, exportRentalContracts);

// Import route
router.route("/master-import").post(verifyJWT, isAdmin, upload.single("file"), masterImport);

export default router;