import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Unit } from "../models/unit.model.js";
import { Tenant } from "../models/tenant.model.js";


const createUnit = asyncHandler(async (req, res) => {
    const {
        floor,
        unit_number,
        zone,
        unit_space_sqm,
        owner,
        remarks,
    } = req.body;

    // ── Validate required fields ──
    if (!floor || !unit_number || !unit_space_sqm || !owner?.name) {
        throw new ApiError(
            400,
            "floor, unit_number, unit_space_sqm and owner.name are required"
        );
    }

    if (unit_space_sqm <= 0) {
        throw new ApiError(400, "unit_space_sqm must be greater than 0");
    }

    // ── Check duplicate (same floor + unit_number) ──
    const existing = await Unit.findOne({ floor, unit_number });
    if (existing) {
        throw new ApiError(
            409,
            `Unit ${unit_number} on floor ${floor} already exists`
        );
    }

    // ── Auto-calculate max card limit ──
    const max_card_limit = Math.floor(unit_space_sqm / 9);

    const unit = await Unit.create({
        floor,
        unit_number,
        zone: zone || null,
        unit_space_sqm,
        max_card_limit,
        owner: {
            qb_code: owner.qb_code || null,
            name: owner.name,
        },
        remarks: remarks || null,
    });

    return res
        .status(201)
        .json(new ApiResponse(201, "Unit created successfully", unit));
});


const getAllUnits = asyncHandler(async (req, res) => {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 10);
    const skip  = (page - 1) * limit;

    // ── Optional filters ──
    const filter = {};
    if (req.query.floor) filter.floor = req.query.floor;
    if (req.query.zone)  filter.zone  = req.query.zone;

    const [units, total] = await Promise.all([
        Unit.find(filter).sort({ floor: 1, unit_number: 1 }).skip(skip).limit(limit),
        Unit.countDocuments(filter),
    ]);

    return res.status(200).json(
        new ApiResponse(200, "Units fetched successfully", {
            units,
            pagination: {
                total,
                page,
                limit,
                total_pages: Math.ceil(total / limit),
            },
        })
    );
});


const getUnitById = asyncHandler(async (req, res) => {
    const unit = await Unit.findById(req.params.id);

    if (!unit) {
        throw new ApiError(404, "Unit not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, "Unit fetched successfully", unit));
});


const updateUnit = asyncHandler(async (req, res) => {
    const unit = await Unit.findById(req.params.id);

    if (!unit) {
        throw new ApiError(404, "Unit not found");
    }

    const {
        floor,
        unit_number,
        zone,
        unit_space_sqm,
        owner,
        remarks,
    } = req.body;

    // ── If floor or unit_number is changing, check for duplicates ──
    const incomingFloor      = floor       || unit.floor;
    const incomingUnitNumber = unit_number || unit.unit_number;

    if (floor || unit_number) {
        const duplicate = await Unit.findOne({
            floor: incomingFloor,
            unit_number: incomingUnitNumber,
            _id: { $ne: unit._id },
        });
        if (duplicate) {
            throw new ApiError(
                409,
                `Unit ${incomingUnitNumber} on floor ${incomingFloor} already exists`
            );
        }
    }

    // ── Update fields ──
    if (floor)        unit.floor       = floor;
    if (unit_number)  unit.unit_number = unit_number;
    if (zone !== undefined) unit.zone  = zone;
    if (remarks !== undefined) unit.remarks = remarks;

    // ── Recalculate max_card_limit if sqm changes ──
    if (unit_space_sqm !== undefined) {
        if (unit_space_sqm <= 0) {
            throw new ApiError(400, "unit_space_sqm must be greater than 0");
        }
        unit.unit_space_sqm = unit_space_sqm;
        unit.max_card_limit = Math.floor(unit_space_sqm / 9);
    }

    // ── Update owner fields selectively ──
    if (owner) {
        if (owner.name)     unit.owner.name     = owner.name;
        if (owner.qb_code !== undefined) unit.owner.qb_code = owner.qb_code;
    }

    await unit.save();

    return res
        .status(200)
        .json(new ApiResponse(200, "Unit updated successfully", unit));
});


const deleteUnit = asyncHandler(async (req, res) => {
    const unit = await Unit.findById(req.params.id);

    if (!unit) {
        throw new ApiError(404, "Unit not found");
    }

    // ── Block deletion if tenants exist under this unit ──
    const tenantCount = await Tenant.countDocuments({ unit_id: unit._id });
    if (tenantCount > 0) {
        throw new ApiError(
            400,
            `Cannot delete unit. ${tenantCount} tenant(s) are linked to this unit. Remove them first.`
        );
    }

    await unit.deleteOne();

    return res
        .status(200)
        .json(new ApiResponse(200, "Unit deleted successfully", null));
});

export {
    createUnit,
    getAllUnits,
    getUnitById,
    updateUnit,
    deleteUnit,
};