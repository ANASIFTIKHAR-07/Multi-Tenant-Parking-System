import {
  getAllCompanies,
  updateCompany,
  deleteCompany,
  addCompany,
  createFloor,
  deleteFloor,
  getAllFloors,
  updateFloor,
  createParkingSlot,
  getParkingSlots,
  updateParkingSlot,
  deleteParkingSlot,
  getParkingLogs,
  assignCompanyToFloor
} from "../controllers/admin.controller.js";
import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/role.middleware.js";

const router = Router();

//  Company Route
router.route("/companies").get(verifyJWT, isAdmin, getAllCompanies);
router.route("/companies").post(verifyJWT, isAdmin, addCompany);
router.route("/companies/assign-floor").put(verifyJWT, isAdmin, assignCompanyToFloor)
router.route("/companies/:id").put(verifyJWT, isAdmin, updateCompany);
router.route("/companies/:id").delete(verifyJWT, isAdmin, deleteCompany);
//  Floor Route
router.route("/floor").post(verifyJWT, isAdmin, createFloor);
router.route("/floors").get(verifyJWT, isAdmin, getAllFloors);
router.route("/floor/:id").delete(verifyJWT, isAdmin, deleteFloor);
router.route("/floor/:id").put(verifyJWT, isAdmin, updateFloor);
//  Parking Slot Route  
router.route("/parking-slots").post(verifyJWT, isAdmin, createParkingSlot);
router.route("/parking-slots").get(verifyJWT, isAdmin, getParkingSlots);
router.route("/parking-slot/:id").put(verifyJWT, isAdmin, updateParkingSlot);
router.route("/parking-slot/:id").delete(verifyJWT, isAdmin, deleteParkingSlot);
//  Parking Log Route
router.route("/parking-logs").get(verifyJWT, isAdmin, getParkingLogs)

export default router;

// router.route("/all-companies").get(verifyJWT, getAllCompanies)
// router.route("/company/:id").put(verifyJWT, updateCompany)
// router.route("/add-company").post(verifyJWT, addCompany)
// router.route("/company/:id").delete(verifyJWT, deleteCompany)
