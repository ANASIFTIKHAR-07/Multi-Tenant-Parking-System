import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Tenant } from "../models/tenant.model.js";
import { Unit } from "../models/unit.model.js";
import { Employee } from "../models/employee.model.js";


const createTenant = asyncHandler(async (req, res) => {
    const {
        unit_id,
        qb_code,
        company_name,
        status,
        lease_start,
        lease_end,
        visitor_card_quota,
        remarks,
    } = req.body;

    if (!unit_id || !company_name) {
        throw new ApiError(400, "unit_id and company_name are required");
    }

    const unit = await Unit.findById(unit_id);
    if (!unit) {
        throw new ApiError(404, "Unit not found");
    }

    const existingTenant = await Tenant.findOne({ unit_id });
    if (existingTenant) {
        throw new ApiError(
            409,
            `Unit ${unit.unit_number} on floor ${unit.floor} already has a tenant assigned`
        );
    }

    if (lease_start && lease_end) {
        if (new Date(lease_start) >= new Date(lease_end)) {
            throw new ApiError(400, "lease_start must be before lease_end");
        }
    }

    const tenant = await Tenant.create({
        unit_id,
        qb_code:              qb_code              || null,
        company_name,
        status:               status               || "ACTIVE",
        lease_start:          lease_start          || null,
        lease_end:            lease_end            || null,
        visitor_card_quota:   visitor_card_quota   || 0,
        remarks:              remarks              || null,

        
        card_quota: {
            max_limit:         unit.max_card_limit,
            active_cards:      0,
            deactivated_cards: 0,
        },
        parking_quota: {
            assigned: { allocated: 0, used: 0 },
            pool:     { allocated: 0, used: 0 },
            rental:   { allocated: 0, used: 0 },
        },
    });

    return res
        .status(201)
        .json(new ApiResponse(201, "Tenant created successfully", tenant));
});


const getAllTenants = asyncHandler(async (req, res) => {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 10);
    const skip  = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    if (req.query.floor) {
        const units = await Unit.find({ floor: req.query.floor }).select("_id");
        const unitIds = units.map((u) => u._id);
        filter.unit_id = { $in: unitIds };
    }

    const [tenants, total] = await Promise.all([
        Tenant.find(filter)
            .populate({
                path: "unit_id",
                select: "floor unit_number zone unit_space_sqm max_card_limit owner",
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        Tenant.countDocuments(filter),
    ]);

    return res.status(200).json(
        new ApiResponse(200, "Tenants fetched successfully", {
            tenants,
            pagination: {
                total,
                page,
                limit,
                total_pages: Math.ceil(total / limit),
            },
        })
    );
});

const getTenantById = asyncHandler(async (req, res) => {
    const tenant = await Tenant.findById(req.params.id).populate({
        path: "unit_id",
        select: "floor unit_number zone unit_space_sqm max_card_limit owner",
    });

    if (!tenant) {
        throw new ApiError(404, "Tenant not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, "Tenant fetched successfully", tenant));
});


const updateTenant = asyncHandler(async (req, res) => {
    const tenant = await Tenant.findById(req.params.id);

    if (!tenant) {
        throw new ApiError(404, "Tenant not found");
    }

    const {
        unit_id,
        qb_code,
        company_name,
        status,
        lease_start,
        lease_end,
        visitor_card_quota,
        parking_quota,
        remarks,
    } = req.body;

    if (unit_id && unit_id.toString() !== tenant.unit_id.toString()) {
        const newUnit = await Unit.findById(unit_id);
        if (!newUnit) {
            throw new ApiError(404, "Unit not found");
        }

        const unitTaken = await Tenant.findOne({
            unit_id,
            _id: { $ne: tenant._id },
        });
        if (unitTaken) {
            throw new ApiError(
                409,
                `Unit ${newUnit.unit_number} on floor ${newUnit.floor} already has a tenant assigned`
            );
        }

        tenant.unit_id = unit_id;
        tenant.card_quota.max_limit = newUnit.max_card_limit;
    }

    const incomingStart = lease_start || tenant.lease_start;
    const incomingEnd   = lease_end   || tenant.lease_end;
    if (incomingStart && incomingEnd) {
        if (new Date(incomingStart) >= new Date(incomingEnd)) {
            throw new ApiError(400, "lease_start must be before lease_end");
        }
    }

    if (qb_code    !== undefined) tenant.qb_code    = qb_code;
    if (company_name)             tenant.company_name = company_name;
    if (status)                   tenant.status       = status;
    if (lease_start !== undefined) tenant.lease_start = lease_start;
    if (lease_end   !== undefined) tenant.lease_end   = lease_end;
    if (remarks     !== undefined) tenant.remarks      = remarks;
    if (visitor_card_quota !== undefined) {
        tenant.visitor_card_quota = visitor_card_quota;
    }

    if (parking_quota) {
        if (parking_quota.assigned?.allocated !== undefined) {
            tenant.parking_quota.assigned.allocated = parking_quota.assigned.allocated;
        }
        if (parking_quota.pool?.allocated !== undefined) {
            tenant.parking_quota.pool.allocated = parking_quota.pool.allocated;
        }
        if (parking_quota.rental?.allocated !== undefined) {
            tenant.parking_quota.rental.allocated = parking_quota.rental.allocated;
        }
    }

    await tenant.save();

    const updated = await Tenant.findById(tenant._id).populate({
        path: "unit_id",
        select: "floor unit_number zone unit_space_sqm max_card_limit owner",
    });

    return res
        .status(200)
        .json(new ApiResponse(200, "Tenant updated successfully", updated));
});


const deleteTenant = asyncHandler(async (req, res) => {
    const tenant = await Tenant.findById(req.params.id);

    if (!tenant) {
        throw new ApiError(404, "Tenant not found");
    }

    const employeeCount = await Employee.countDocuments({ tenant_id: tenant._id });
    if (employeeCount > 0) {
        throw new ApiError(
            400,
            `Cannot delete tenant. ${employeeCount} employee(s) are linked to this tenant. Remove them first.`
        );
    }

    await tenant.deleteOne();

    return res
        .status(200)
        .json(new ApiResponse(200, "Tenant deleted successfully", null));
});

export {
    createTenant,
    getAllTenants,
    getTenantById,
    updateTenant,
    deleteTenant,
};