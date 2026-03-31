import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { RentalContract } from "../models/rentalContract.model.js";
import { Tenant } from "../models/tenant.model.js";
import { ParkingRecord } from "../models/parkingRecord.model.js";
import { Unit } from "../models/unit.model.js";


const getFullContract = async (contractId) => {
    return await RentalContract.findById(contractId).populate({
        path: "tenant_id",
        select: "company_name qb_code parking_quota",
        populate: {
            path: "unit_id",
            select: "floor unit_number zone owner",
        },
    });
};


const createRentalContract = asyncHandler(async (req, res) => {
    const {
        tenant_id,
        contract_ref_number,
        company_name,
        floor,
        unit,
        slots_allocated,
        duration_months,
        start_date,
        end_date,
        remarks,
    } = req.body;

    if (
        !tenant_id ||
        !contract_ref_number ||
        !company_name ||
        !slots_allocated ||
        !duration_months ||
        !start_date ||
        !end_date
    ) {
        throw new ApiError(
            400,
            "tenant_id, contract_ref_number, company_name, slots_allocated, duration_months, start_date and end_date are required"
        );
    }

    if (slots_allocated <= 0) {
        throw new ApiError(400, "slots_allocated must be greater than 0");
    }

    if (duration_months <= 0) {
        throw new ApiError(400, "duration_months must be greater than 0");
    }

    if (new Date(start_date) >= new Date(end_date)) {
        throw new ApiError(400, "start_date must be before end_date");
    }

    const tenant = await Tenant.findById(tenant_id);
    if (!tenant) {
        throw new ApiError(404, "Tenant not found");
    }
    if (tenant.status !== "ACTIVE") {
        throw new ApiError(
            400,
            "Cannot create a rental contract for an inactive tenant"
        );
    }

    const duplicate = await RentalContract.findOne({ contract_ref_number });
    if (duplicate) {
        throw new ApiError(
            409,
            `Contract reference number ${contract_ref_number} already exists`
        );
    }

    const contract = await RentalContract.create({
        tenant_id,
        contract_ref_number,
        company_name,
        floor:          floor   || null,
        unit:           unit    || null,
        slots_allocated,
        slots_used:     0,
        duration_months,
        start_date:     new Date(start_date),
        end_date:       new Date(end_date),
        status:         "ACTIVE",
        remarks:        remarks || null,
    });

    await Tenant.findByIdAndUpdate(tenant_id, {
        $inc: { "parking_quota.rental.allocated": slots_allocated },
    });

    const populated = await getFullContract(contract._id);

    return res
        .status(201)
        .json(
            new ApiResponse(201, "Rental contract created successfully", populated)
        );
});


const getAllRentalContracts = asyncHandler(async (req, res) => {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 10);
    const skip  = (page - 1) * limit;

    const filter = {};
    if (req.query.tenant_id) filter.tenant_id = req.query.tenant_id;
    if (req.query.status)    filter.status    = req.query.status;

    if (req.query.floor) {
        const units = await Unit.find({ floor: req.query.floor }).select("_id");
        const unitIds = units.map((u) => u._id);
        const tenants = await Tenant.find({
            unit_id: { $in: unitIds },
        }).select("_id");
        filter.tenant_id = { $in: tenants.map((t) => t._id) };
    }

    const [contracts, total] = await Promise.all([
        RentalContract.find(filter)
            .populate({
                path: "tenant_id",
                select: "company_name qb_code",
                populate: {
                    path: "unit_id",
                    select: "floor unit_number zone",
                },
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        RentalContract.countDocuments(filter),
    ]);

    const enriched = contracts.map((c) => {
        const obj             = c.toObject();
        obj.slots_remaining   = c.slots_allocated - c.slots_used;
        obj.days_until_expiry = Math.ceil(
            (new Date(c.end_date) - new Date()) / (1000 * 60 * 60 * 24)
        );
        return obj;
    });

    return res.status(200).json(
        new ApiResponse(200, "Rental contracts fetched successfully", {
            contracts: enriched,
            pagination: {
                total,
                page,
                limit,
                total_pages: Math.ceil(total / limit),
            },
        })
    );
});


const getRentalContractById = asyncHandler(async (req, res) => {
    const contract = await getFullContract(req.params.id);
    if (!contract) {
        throw new ApiError(404, "Rental contract not found");
    }

    const parkingRecords = await ParkingRecord.find({
        rental_contract_id: contract._id,
    })
        .populate({
            path: "employee_id",
            select: "full_name id_card_number job_title",
        })
        .select(
            "employee_id car_plate_number sticker_number car_tag badge_id sr_number status assigned_at cancelled_at remarks"
        )
        .sort({ createdAt: -1 });

    const result = {
        ...contract.toObject(),
        slots_remaining:   contract.slots_allocated - contract.slots_used,
        days_until_expiry: Math.ceil(
            (new Date(contract.end_date) - new Date()) / (1000 * 60 * 60 * 24)
        ),
        parking_records: parkingRecords,
    };

    return res
        .status(200)
        .json(
            new ApiResponse(200, "Rental contract fetched successfully", result)
        );
});


const updateRentalContract = asyncHandler(async (req, res) => {
    const contract = await RentalContract.findById(req.params.id);
    if (!contract) {
        throw new ApiError(404, "Rental contract not found");
    }

    if (contract.status === "CANCELLED") {
        throw new ApiError(400, "Cannot update a cancelled rental contract");
    }

    const {
        contract_ref_number,
        company_name,
        floor,
        unit,
        slots_allocated,
        duration_months,
        start_date,
        end_date,
        status,
        remarks,
    } = req.body;

    if (
        contract_ref_number &&
        contract_ref_number !== contract.contract_ref_number
    ) {
        const duplicate = await RentalContract.findOne({
            contract_ref_number,
            _id: { $ne: contract._id },
        });
        if (duplicate) {
            throw new ApiError(
                409,
                `Contract reference number ${contract_ref_number} already exists`
            );
        }
        contract.contract_ref_number = contract_ref_number;
    }

    const incomingStart = start_date ? new Date(start_date) : contract.start_date;
    const incomingEnd   = end_date   ? new Date(end_date)   : contract.end_date;
    if (incomingStart >= incomingEnd) {
        throw new ApiError(400, "start_date must be before end_date");
    }

    if (slots_allocated !== undefined) {
        if (slots_allocated <= 0) {
            throw new ApiError(400, "slots_allocated must be greater than 0");
        }
        if (slots_allocated < contract.slots_used) {
            throw new ApiError(
                400,
                `Cannot reduce slots to ${slots_allocated}. ${contract.slots_used} slot(s) are currently in use`
            );
        }

        const diff = slots_allocated - contract.slots_allocated;
        if (diff !== 0) {
            await Tenant.findByIdAndUpdate(contract.tenant_id, {
                $inc: { "parking_quota.rental.allocated": diff },
            });
        }

        contract.slots_allocated = slots_allocated;
    }

    if (company_name)          contract.company_name    = company_name;
    if (floor !== undefined)   contract.floor           = floor;
    if (unit  !== undefined)   contract.unit            = unit;
    if (duration_months)       contract.duration_months = duration_months;
    if (start_date)            contract.start_date      = new Date(start_date);
    if (end_date)              contract.end_date        = new Date(end_date);
    if (status)                contract.status          = status;
    if (remarks !== undefined) contract.remarks         = remarks;

    await contract.save();

    const updated = await getFullContract(contract._id);

    return res
        .status(200)
        .json(
            new ApiResponse(200, "Rental contract updated successfully", updated)
        );
});


const deleteRentalContract = asyncHandler(async (req, res) => {
    const contract = await RentalContract.findById(req.params.id);
    if (!contract) {
        throw new ApiError(404, "Rental contract not found");
    }

    const activeParkingCount = await ParkingRecord.countDocuments({
        rental_contract_id: contract._id,
        status:             "ACTIVE",
    });
    if (activeParkingCount > 0) {
        throw new ApiError(
            400,
            `Cannot delete contract. ${activeParkingCount} active parking record(s) are linked. Cancel them first.`
        );
    }

    await Tenant.findByIdAndUpdate(contract.tenant_id, {
        $inc: {
            "parking_quota.rental.allocated": -contract.slots_allocated,
        },
    });

    await contract.deleteOne();

    return res
        .status(200)
        .json(
            new ApiResponse(200, "Rental contract deleted successfully", null)
        );
});

export {
    createRentalContract,
    getAllRentalContracts,
    getRentalContractById,
    updateRentalContract,
    deleteRentalContract,
};