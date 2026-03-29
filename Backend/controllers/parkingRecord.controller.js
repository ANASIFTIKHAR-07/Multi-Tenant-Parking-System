import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ParkingRecord } from "../models/parkingRecord.model.js";
import { Employee } from "../models/employee.model.js";
import { Tenant } from "../models/tenant.model.js";
import { RentalContract } from "../models/rentalContract.model.js";


const getFullParkingRecord = async (recordId) => {
    return await ParkingRecord.findById(recordId)
        .populate({
            path: "employee_id",
            select: "full_name id_card_number job_title vehicles",
        })
        .populate({
            path: "tenant_id",
            select: "company_name qb_code parking_quota",
            populate: {
                path: "unit_id",
                select: "floor unit_number zone owner",
            },
        })
        .populate({
            path: "rental_contract_id",
            select: "contract_ref_number start_date end_date status slots_allocated slots_used duration_months",
        });
};

// ─────────────────────────────────────────────
// CREATE PARKING RECORD
// POST /api/v1/parking
//
// Business rules per parking type:
//
//   ASSIGNED → assigned_slot (slot_code + floor_number) required
//              slot_code must not be taken by another active record
//              checks tenant assigned.allocated vs used quota
//
//   POOL     → no slot required
//              checks tenant pool.allocated vs used quota
//
//   RENTAL   → rental_contract_id required
//              contract must be ACTIVE and not fully used
//              increments contract slots_used
//              checks tenant rental.allocated vs used quota
// ─────────────────────────────────────────────
const createParkingRecord = asyncHandler(async (req, res) => {
    const {
        employee_id,
        car_plate_number,
        parking_type,
        badge_id,
        sticker_number,
        car_tag,
        sr_number,
        assigned_slot,
        rental_contract_id,
        remarks,
    } = req.body;

    if (!employee_id || !car_plate_number || !parking_type) {
        throw new ApiError(
            400,
            "employee_id, car_plate_number and parking_type are required"
        );
    }

    const validTypes = ["ASSIGNED", "POOL", "RENTAL"];
    if (!validTypes.includes(parking_type)) {
        throw new ApiError(
            400,
            `parking_type must be one of: ${validTypes.join(", ")}`
        );
    }

    const employee = await Employee.findById(employee_id);
    if (!employee) {
        throw new ApiError(404, "Employee not found");
    }
    if (employee.status !== "ACTIVE") {
        throw new ApiError(
            400,
            "Cannot assign parking to an inactive employee"
        );
    }

    const tenant = await Tenant.findById(employee.tenant_id);
    if (!tenant) {
        throw new ApiError(404, "Tenant not found");
    }
    if (tenant.status !== "ACTIVE") {
        throw new ApiError(
            400,
            "Cannot assign parking under an inactive tenant"
        );
    }

    const vehicleExists = employee.vehicles.some(
        (v) => v.car_plate_number === car_plate_number
    );
    if (!vehicleExists) {
        throw new ApiError(
            400,
            `Car plate ${car_plate_number} is not registered under this employee. Add it first.`
        );
    }

    const duplicatePlate = await ParkingRecord.findOne({
        car_plate_number,
        status: "ACTIVE",
    });
    if (duplicatePlate) {
        throw new ApiError(
            409,
            `Car plate ${car_plate_number} already has an active parking record`
        );
    }

    let rentalContract = null;

    if (parking_type === "ASSIGNED") {

        if (!assigned_slot?.slot_code || !assigned_slot?.floor_number) {
            throw new ApiError(
                400,
                "assigned_slot.slot_code and assigned_slot.floor_number are required for ASSIGNED parking"
            );
        }

        const slotTaken = await ParkingRecord.findOne({
            "assigned_slot.slot_code": assigned_slot.slot_code,
            status: "ACTIVE",
        });
        if (slotTaken) {
            throw new ApiError(
                409,
                `Parking slot ${assigned_slot.slot_code} is already occupied by another active record`
            );
        }

        const { allocated, used } = tenant.parking_quota.assigned;
        if (used >= allocated) {
            throw new ApiError(
                400,
                `Assigned parking quota exceeded. ${tenant.company_name} has used all ${allocated} allocated assigned slot(s)`
            );
        }
    }

    if (parking_type === "POOL") {
        const { allocated, used } = tenant.parking_quota.pool;
        if (used >= allocated) {
            throw new ApiError(
                400,
                `Pool parking quota exceeded. ${tenant.company_name} has used all ${allocated} allocated pool slot(s)`
            );
        }
    }

    if (parking_type === "RENTAL") {
        if (!rental_contract_id) {
            throw new ApiError(
                400,
                "rental_contract_id is required for RENTAL parking"
            );
        }

        rentalContract = await RentalContract.findById(rental_contract_id);
        if (!rentalContract) {
            throw new ApiError(404, "Rental contract not found");
        }
        if (rentalContract.tenant_id.toString() !== tenant._id.toString()) {
            throw new ApiError(
                400,
                "Rental contract does not belong to this tenant"
            );
        }
        if (rentalContract.status !== "ACTIVE") {
            throw new ApiError(
                400,
                `Rental contract ${rentalContract.contract_ref_number} is ${rentalContract.status.toLowerCase()} and cannot be used`
            );
        }

        if (rentalContract.slots_used >= rentalContract.slots_allocated) {
            throw new ApiError(
                400,
                `Rental contract ${rentalContract.contract_ref_number} has no remaining slots. All ${rentalContract.slots_allocated} slot(s) are in use`
            );
        }

        const { allocated, used } = tenant.parking_quota.rental;
        if (used >= allocated) {
            throw new ApiError(
                400,
                `Rental parking quota exceeded. ${tenant.company_name} has used all ${allocated} allocated rental slot(s)`
            );
        }
    }

    const record = await ParkingRecord.create({
        employee_id,
        tenant_id:          employee.tenant_id,
        rental_contract_id: rental_contract_id || null,
        badge_id:           badge_id           || null,
        car_plate_number,
        sticker_number:     sticker_number     || null,
        car_tag:            car_tag            || null,
        parking_type,
        sr_number:          sr_number          || null,
        assigned_slot:      parking_type === "ASSIGNED" ? assigned_slot : null,
        status:             "ACTIVE",
        assigned_at:        new Date(),
        remarks:            remarks            || null,
    });

    const quotaField = {
        ASSIGNED: "parking_quota.assigned.used",
        POOL:     "parking_quota.pool.used",
        RENTAL:   "parking_quota.rental.used",
    }[parking_type];

    await Tenant.findByIdAndUpdate(tenant._id, {
        $inc: { [quotaField]: 1 },
    });

    if (parking_type === "RENTAL") {
        await RentalContract.findByIdAndUpdate(rental_contract_id, {
            $inc: { slots_used: 1 },
        });
    }

    const populated = await getFullParkingRecord(record._id);

    return res
        .status(201)
        .json(
            new ApiResponse(201, "Parking record created successfully", populated)
        );
});


const getAllParkingRecords = asyncHandler(async (req, res) => {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 10);
    const skip  = (page - 1) * limit;

    const filter = {};
    if (req.query.tenant_id)    filter.tenant_id    = req.query.tenant_id;
    if (req.query.parking_type) filter.parking_type = req.query.parking_type;
    if (req.query.status)       filter.status       = req.query.status;

    if (req.query.floor) {
        const { Unit } = await import("../models/unit.model.js");
        const units = await Unit.find({ floor: req.query.floor }).select("_id");
        const unitIds = units.map((u) => u._id);
        const tenants = await Tenant.find({
            unit_id: { $in: unitIds },
        }).select("_id");
        const tenantIds = tenants.map((t) => t._id);
        filter.tenant_id = { $in: tenantIds };
    }

    const [records, total] = await Promise.all([
        ParkingRecord.find(filter)
            .populate({
                path: "employee_id",
                select: "full_name id_card_number job_title",
            })
            .populate({
                path: "tenant_id",
                select: "company_name qb_code",
                populate: {
                    path: "unit_id",
                    select: "floor unit_number zone",
                },
            })
            .populate({
                path: "rental_contract_id",
                select: "contract_ref_number start_date end_date status",
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        ParkingRecord.countDocuments(filter),
    ]);

    return res.status(200).json(
        new ApiResponse(200, "Parking records fetched successfully", {
            records,
            pagination: {
                total,
                page,
                limit,
                total_pages: Math.ceil(total / limit),
            },
        })
    );
});


const getParkingRecordById = asyncHandler(async (req, res) => {
    const record = await getFullParkingRecord(req.params.id);

    if (!record) {
        throw new ApiError(404, "Parking record not found");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, "Parking record fetched successfully", record)
        );
});


const cancelParkingRecord = asyncHandler(async (req, res) => {
    const { remarks } = req.body;

    const record = await ParkingRecord.findById(req.params.id);
    if (!record) {
        throw new ApiError(404, "Parking record not found");
    }

    if (record.status === "CANCELLED") {
        throw new ApiError(400, "Parking record is already cancelled");
    }

    record.status       = "CANCELLED";
    record.cancelled_at = new Date();
    if (remarks !== undefined) record.remarks = remarks;

    await record.save();

    const quotaField = {
        ASSIGNED: "parking_quota.assigned.used",
        POOL:     "parking_quota.pool.used",
        RENTAL:   "parking_quota.rental.used",
    }[record.parking_type];

    await Tenant.findByIdAndUpdate(record.tenant_id, {
        $inc: { [quotaField]: -1 },
    });

    if (record.parking_type === "RENTAL" && record.rental_contract_id) {
        await RentalContract.findByIdAndUpdate(record.rental_contract_id, {
            $inc: { slots_used: -1 },
        });
    }

    const updated = await getFullParkingRecord(record._id);

    return res
        .status(200)
        .json(
            new ApiResponse(200, "Parking record cancelled successfully", updated)
        );
});

export {
    createParkingRecord,
    getAllParkingRecords,
    getParkingRecordById,
    cancelParkingRecord,
};