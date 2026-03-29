import { exportParkingLogs } from "../controllers/csv.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { isAdmin } from "../middlewares/role.middleware.js"
import { Router } from "express"


const router = Router();

router.route("/parking-logs/export").get(verifyJWT, isAdmin, exportParkingLogs);


export default router;