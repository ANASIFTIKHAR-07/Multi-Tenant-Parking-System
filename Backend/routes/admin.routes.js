import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/role.middleware.js";

// ── Controllers ──
import {
    createUnit,
    getAllUnits,
    getUnitById,
    updateUnit,
    deleteUnit,
} from "../controllers/unit.controller.js";

import {
    createTenant,
    getAllTenants,
    getTenantById,
    updateTenant,
    deleteTenant,
} from "../controllers/tenant.controller.js";

import {
    createEmployee,
    getAllEmployees,
    getEmployeeById,
    updateEmployee,
    addVehicle,
    removeVehicle,
    deleteEmployee,
} from "../controllers/employee.controller.js";

import {
    issueAccessBadge,
    getAllAccessBadges,
    getAccessBadgeById,
    deactivateAccessBadge,
    getEmployeeBadgeHistory,
} from "../controllers/accessBadge.controller.js";

import {
    createParkingRecord,
    getAllParkingRecords,
    getParkingRecordById,
    cancelParkingRecord,
} from "../controllers/parkingRecord.controller.js";

import {
    createRentalContract,
    getAllRentalContracts,
    getRentalContractById,
    updateRentalContract,
    deleteRentalContract,
} from "../controllers/rentalContract.controller.js";

import {
    issueVisitorCard,
    getAllVisitorCards,
    getVisitorCardById,
    checkInVisitor,
    checkOutVisitor,
    deactivateVisitorCard,
} from "../controllers/visitorCard.controller.js";

const router = Router();


// ── Unit Routes ──
router.route("/units").post(verifyJWT, isAdmin, createUnit);
router.route("/units").get(verifyJWT, isAdmin, getAllUnits);
router.route("/units/:id").get(verifyJWT, isAdmin, getUnitById);
router.route("/units/:id").patch(verifyJWT, isAdmin, updateUnit);
router.route("/units/:id").delete(verifyJWT, isAdmin, deleteUnit);

// ── Tenant Routes ──
router.route("/tenants").post(verifyJWT, isAdmin, createTenant);
router.route("/tenants").get(verifyJWT, isAdmin, getAllTenants);
router.route("/tenants/:id").get(verifyJWT, isAdmin, getTenantById);
router.route("/tenants/:id").patch(verifyJWT, isAdmin, updateTenant);
router.route("/tenants/:id").delete(verifyJWT, isAdmin, deleteTenant);

// ── Employee Routes ──
router.route("/employees").post(verifyJWT, isAdmin, createEmployee);
router.route("/employees").get(verifyJWT, isAdmin, getAllEmployees);
router.route("/employees/:id").get(verifyJWT, isAdmin, getEmployeeById);
router.route("/employees/:id").patch(verifyJWT, isAdmin, updateEmployee);
router.route("/employees/:id/vehicles").post(verifyJWT, isAdmin, addVehicle);
router.route("/employees/:id/vehicles/:plateNumber").delete(verifyJWT, isAdmin, removeVehicle);
router.route("/employees/:id").delete(verifyJWT, isAdmin, deleteEmployee);

// ── Access Badge Routes ──
router.route("/badges").post(verifyJWT, isAdmin, issueAccessBadge);
router.route("/badges").get(verifyJWT, isAdmin, getAllAccessBadges);
router.route("/badges/:id").get(verifyJWT, isAdmin, getAccessBadgeById);
router.route("/badges/:id/deactivate").patch(verifyJWT, isAdmin, deactivateAccessBadge);
router.route("/badges/employee/:employeeId/history").get(verifyJWT, isAdmin, getEmployeeBadgeHistory);

// ── Parking Record Routes ──
router.route("/parking").post(verifyJWT, isAdmin, createParkingRecord);
router.route("/parking").get(verifyJWT, isAdmin, getAllParkingRecords);
router.route("/parking/:id").get(verifyJWT, isAdmin, getParkingRecordById);
router.route("/parking/:id/cancel").patch(verifyJWT, isAdmin, cancelParkingRecord);

// ── Rental Contract Routes ──
router.route("/rental-contracts").post(verifyJWT, isAdmin, createRentalContract);
router.route("/rental-contracts").get(verifyJWT, isAdmin, getAllRentalContracts);
router.route("/rental-contracts/:id").get(verifyJWT, isAdmin, getRentalContractById);
router.route("/rental-contracts/:id").patch(verifyJWT, isAdmin, updateRentalContract);
router.route("/rental-contracts/:id").delete(verifyJWT, isAdmin, deleteRentalContract);

// ── Visitor Card Routes ──
router.route("/visitor-cards").post(verifyJWT, isAdmin, issueVisitorCard);
router.route("/visitor-cards").get(verifyJWT, isAdmin, getAllVisitorCards);
router.route("/visitor-cards/:id").get(verifyJWT, isAdmin, getVisitorCardById);
router.route("/visitor-cards/:id/check-in").patch(verifyJWT, isAdmin, checkInVisitor);
router.route("/visitor-cards/:id/check-out").patch(verifyJWT, isAdmin, checkOutVisitor);
router.route("/visitor-cards/:id/deactivate").patch(verifyJWT, isAdmin, deactivateVisitorCard);

export default router;