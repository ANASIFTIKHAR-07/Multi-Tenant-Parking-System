import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Employee } from "../models/employee.model.js";
import { Tenant } from "../models/tenant.model.js";
import { AccessBadge } from "../models/accessBadge.model.js";
import { ParkingRecord } from "../models/parkingRecord.model.js";


const getFullEmployeeProfile = async (employeeId) => {
    const [employee, activeBadge, parkingRecords] = await Promise.all([
        Employee.findById(employeeId)
            .populate({
                path: "tenant_id",
                select: "company_name qb_code status card_quota parking_quota",
                populate: {
                    path: "unit_id",
                    select: "floor unit_number zone unit_space_sqm max_card_limit owner",
                },
            }),

        AccessBadge.findOne({ employee_id: employeeId, status: "ACTIVE" })
            .select("badge_number sr_number sr_number_secondary status access_level issued_at"),

        ParkingRecord.find({ employee_id: employeeId, status: "ACTIVE" })
            .select("car_plate_number sticker_number car_tag parking_type sr_number assigned_slot badge_id remarks")
            .populate({
                path: "rental_contract_id",
                select: "contract_ref_number start_date end_date status slots_allocated slots_used",
            }),
    ]);

    return {
        ...employee.toObject(),
        active_badge:    activeBadge   || null,
        parking_records: parkingRecords || [],
    };
};


const createEmployee = asyncHandler(async (req, res) => {
    const {
        tenant_id,
        full_name,
        id_card_number,
        job_title,
        vehicles,
        remarks,
    } = req.body;

    if (!tenant_id || !full_name) {
        throw new ApiError(400, "tenant_id and full_name are required");
    }

    const tenant = await Tenant.findById(tenant_id);
    if (!tenant) {
        throw new ApiError(404, "Tenant not found");
    }
    if (tenant.status !== "ACTIVE") {
        throw new ApiError(400, "Cannot add employees to an inactive tenant");
    }

    if (id_card_number) {
        const duplicate = await Employee.findOne({ id_card_number });
        if (duplicate) {
            throw new ApiError(
                409,
                `An employee with ID card number ${id_card_number} already exists`
            );
        }
    }

    if (vehicles && vehicles.length > 0) {
        const plates = vehicles.map((v) => v.car_plate_number).filter(Boolean);

        if (plates.length !== new Set(plates).size) {
            throw new ApiError(400, "Duplicate car plate numbers in the request");
        }

        const existingPlate = await Employee.findOne({
            "vehicles.car_plate_number": { $in: plates },
        });
        if (existingPlate) {
            throw new ApiError(
                409,
                "One or more car plate numbers are already registered to another employee"
            );
        }

        const primaryCount = vehicles.filter((v) => v.is_primary).length;
        if (primaryCount > 1) {
            throw new ApiError(400, "Only one vehicle can be marked as primary");
        }
    }

    const employee = await Employee.create({
        tenant_id,
        full_name,
        id_card_number: id_card_number || null,
        job_title:      job_title      || null,
        vehicles:       vehicles       || [],
        status:         "ACTIVE",
        remarks:        remarks        || null,
    });

    const profile = await getFullEmployeeProfile(employee._id);

    return res
        .status(201)
        .json(new ApiResponse(201, "Employee created successfully", profile));
});


const getAllEmployees = asyncHandler(async (req, res) => {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 10);
    const skip  = (page - 1) * limit;

    const filter = {};
    if (req.query.tenant_id) filter.tenant_id = req.query.tenant_id;
    if (req.query.status)    filter.status    = req.query.status;

    const [employees, total] = await Promise.all([
        Employee.find(filter)
            .populate({
                path: "tenant_id",
                select: "company_name qb_code status",
                populate: {
                    path: "unit_id",
                    select: "floor unit_number zone owner",
                },
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        Employee.countDocuments(filter),
    ]);

    const employeeIds = employees.map((e) => e._id);

    const [badges, parkingRecords] = await Promise.all([
        AccessBadge.find({
            employee_id: { $in: employeeIds },
            status: "ACTIVE",
        }).select("employee_id badge_number sr_number status"),

        ParkingRecord.find({
            employee_id: { $in: employeeIds },
            status: "ACTIVE",
        }).select("employee_id car_plate_number parking_type assigned_slot sticker_number car_tag"),
    ]);

    const badgeMap   = {};
    const parkingMap = {};

    badges.forEach((b) => {
        badgeMap[b.employee_id.toString()] = b;
    });
    parkingRecords.forEach((p) => {
        if (!parkingMap[p.employee_id.toString()]) {
            parkingMap[p.employee_id.toString()] = [];
        }
        parkingMap[p.employee_id.toString()].push(p);
    });

    const enriched = employees.map((emp) => {
        const id = emp._id.toString();
        return {
            ...emp.toObject(),
            active_badge:    badgeMap[id]   || null,
            parking_records: parkingMap[id] || [],
        };
    });

    return res.status(200).json(
        new ApiResponse(200, "Employees fetched successfully", {
            employees: enriched,
            pagination: {
                total,
                page,
                limit,
                total_pages: Math.ceil(total / limit),
            },
        })
    );
});


const getEmployeeById = asyncHandler(async (req, res) => {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
        throw new ApiError(404, "Employee not found");
    }

    const profile = await getFullEmployeeProfile(employee._id);

    return res
        .status(200)
        .json(new ApiResponse(200, "Employee fetched successfully", profile));
});


const updateEmployee = asyncHandler(async (req, res) => {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
        throw new ApiError(404, "Employee not found");
    }

    const {
        full_name,
        id_card_number,
        job_title,
        status,
        remarks,
    } = req.body;

    if (id_card_number && id_card_number !== employee.id_card_number) {
        const duplicate = await Employee.findOne({
            id_card_number,
            _id: { $ne: employee._id },
        });
        if (duplicate) {
            throw new ApiError(
                409,
                `An employee with ID card number ${id_card_number} already exists`
            );
        }
    }

    if (full_name)              employee.full_name      = full_name;
    if (id_card_number !== undefined) employee.id_card_number = id_card_number;
    if (job_title      !== undefined) employee.job_title      = job_title;
    if (status)                 employee.status         = status;
    if (remarks        !== undefined) employee.remarks        = remarks;

    await employee.save();

    const profile = await getFullEmployeeProfile(employee._id);

    return res
        .status(200)
        .json(new ApiResponse(200, "Employee updated successfully", profile));
});


const addVehicle = asyncHandler(async (req, res) => {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
        throw new ApiError(404, "Employee not found");
    }

    const { car_plate_number, sticker_number, car_tag, is_primary } = req.body;

    if (!car_plate_number) {
        throw new ApiError(400, "car_plate_number is required");
    }

    const existing = await Employee.findOne({
        "vehicles.car_plate_number": car_plate_number,
    });
    if (existing) {
        throw new ApiError(
            409,
            `Car plate ${car_plate_number} is already registered to another employee`
        );
    }

    if (is_primary) {
        employee.vehicles.forEach((v) => (v.is_primary = false));
    }

    employee.vehicles.push({
        car_plate_number,
        sticker_number: sticker_number || null,
        car_tag:        car_tag        || null,
        is_primary:     is_primary     || false,
    });

    await employee.save();

    return res
        .status(200)
        .json(new ApiResponse(200, "Vehicle added successfully", employee.vehicles));
});


const removeVehicle = asyncHandler(async (req, res) => {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
        throw new ApiError(404, "Employee not found");
    }

    const { plateNumber } = req.params;

    const vehicleIndex = employee.vehicles.findIndex(
        (v) => v.car_plate_number === plateNumber
    );
    if (vehicleIndex === -1) {
        throw new ApiError(404, `Vehicle with plate ${plateNumber} not found`);
    }

    const activeParking = await ParkingRecord.findOne({
        employee_id:      employee._id,
        car_plate_number: plateNumber,
        status:           "ACTIVE",
    });
    if (activeParking) {
        throw new ApiError(
            400,
            `Cannot remove vehicle. Plate ${plateNumber} has an active parking record. Cancel it first.`
        );
    }

    employee.vehicles.splice(vehicleIndex, 1);
    await employee.save();

    return res
        .status(200)
        .json(new ApiResponse(200, "Vehicle removed successfully", employee.vehicles));
});


const deleteEmployee = asyncHandler(async (req, res) => {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
        throw new ApiError(404, "Employee not found");
    }

    const activeBadgeCount = await AccessBadge.countDocuments({
        employee_id: employee._id,
        status:      "ACTIVE",
    });
    if (activeBadgeCount > 0) {
        throw new ApiError(
            400,
            `Cannot delete employee. ${activeBadgeCount} active badge(s) are linked. Deactivate them first.`
        );
    }

    const activeParkingCount = await ParkingRecord.countDocuments({
        employee_id: employee._id,
        status:      "ACTIVE",
    });
    if (activeParkingCount > 0) {
        throw new ApiError(
            400,
            `Cannot delete employee. ${activeParkingCount} active parking record(s) are linked. Cancel them first.`
        );
    }

    await employee.deleteOne();

    return res
        .status(200)
        .json(new ApiResponse(200, "Employee deleted successfully", null));
});

export {
    createEmployee,
    getAllEmployees,
    getEmployeeById,
    updateEmployee,
    addVehicle,
    removeVehicle,
    deleteEmployee,
};