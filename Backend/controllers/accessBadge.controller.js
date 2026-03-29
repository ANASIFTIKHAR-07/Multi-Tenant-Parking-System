import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { AccessBadge } from "../models/accessBadge.model.js";
import { Employee } from "../models/employee.model.js";
import { Tenant } from "../models/tenant.model.js";


const issueAccessBadge = asyncHandler(async (req, res) => {
    const {
        employee_id,
        badge_number,
        sr_number,
        sr_number_secondary,
        access_level,
        access_level_description,
        remarks,
    } = req.body;

    if (!employee_id || !badge_number) {
        throw new ApiError(400, "employee_id and badge_number are required");
    }

    const employee = await Employee.findById(employee_id);
    if (!employee) {
        throw new ApiError(404, "Employee not found");
    }
    if (employee.status !== "ACTIVE") {
        throw new ApiError(
            400,
            "Cannot issue a badge to an inactive employee"
        );
    }

    const tenant = await Tenant.findById(employee.tenant_id);
    if (!tenant) {
        throw new ApiError(404, "Tenant not found");
    }

    
    if (tenant.card_quota.active_cards >= tenant.card_quota.max_limit) {
        throw new ApiError(
            400,
            `Card quota exceeded. ${tenant.company_name} has reached its maximum limit of ${tenant.card_quota.max_limit} active cards`
        );
    }

    const duplicateBadge = await AccessBadge.findOne({ badge_number });
    if (duplicateBadge) {
        throw new ApiError(
            409,
            `Badge number ${badge_number} is already assigned to another employee`
        );
    }

    const existingActiveBadge = await AccessBadge.findOne({
        employee_id,
        status: "ACTIVE",
    });
    if (existingActiveBadge) {
        throw new ApiError(
            400,
            `Employee already has an active badge (${existingActiveBadge.badge_number}). Deactivate it first before issuing a new one`
        );
    }

    const badge = await AccessBadge.create({
        employee_id,
        tenant_id:               employee.tenant_id,
        badge_number,
        sr_number:               sr_number               || null,
        sr_number_secondary:     sr_number_secondary     || null,
        access_level:            access_level            || null,
        access_level_description:access_level_description|| null,
        status:                  "ACTIVE",
        issued_at:               new Date(),
        remarks:                 remarks                 || null,
    });

    await Tenant.findByIdAndUpdate(tenant._id, {
        $inc: { "card_quota.active_cards": 1 },
    });

    const populated = await AccessBadge.findById(badge._id)
        .populate({
            path: "employee_id",
            select: "full_name id_card_number job_title vehicles",
        })
        .populate({
            path: "tenant_id",
            select: "company_name qb_code card_quota",
        });

    return res
        .status(201)
        .json(new ApiResponse(201, "Access badge issued successfully", populated));
});


const getAllAccessBadges = asyncHandler(async (req, res) => {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 10);
    const skip  = (page - 1) * limit;

    const filter = {};
    if (req.query.tenant_id)   filter.tenant_id   = req.query.tenant_id;
    if (req.query.employee_id) filter.employee_id = req.query.employee_id;
    if (req.query.status)      filter.status      = req.query.status;

    const [badges, total] = await Promise.all([
        AccessBadge.find(filter)
            .populate({
                path: "employee_id",
                select: "full_name id_card_number job_title",
            })
            .populate({
                path: "tenant_id",
                select: "company_name qb_code",
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        AccessBadge.countDocuments(filter),
    ]);

    return res.status(200).json(
        new ApiResponse(200, "Access badges fetched successfully", {
            badges,
            pagination: {
                total,
                page,
                limit,
                total_pages: Math.ceil(total / limit),
            },
        })
    );
});


const getAccessBadgeById = asyncHandler(async (req, res) => {
    const badge = await AccessBadge.findById(req.params.id)
        .populate({
            path: "employee_id",
            select: "full_name id_card_number job_title vehicles status",
        })
        .populate({
            path: "tenant_id",
            select: "company_name qb_code card_quota",
            populate: {
                path: "unit_id",
                select: "floor unit_number zone",
            },
        });

    if (!badge) {
        throw new ApiError(404, "Access badge not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, "Access badge fetched successfully", badge));
});


const getEmployeeBadgeHistory = asyncHandler(async (req, res) => {
    const employee = await Employee.findById(req.params.employeeId);
    if (!employee) {
        throw new ApiError(404, "Employee not found");
    }

    const history = await AccessBadge.find({
        employee_id: req.params.employeeId,
    })
        .populate({
            path: "tenant_id",
            select: "company_name qb_code",
        })
        .sort({ issued_at: -1 });

    return res.status(200).json(
        new ApiResponse(200, "Badge history fetched successfully", {
            employee: {
                _id:            employee._id,
                full_name:      employee.full_name,
                id_card_number: employee.id_card_number,
            },
            total_badges: history.length,
            history,
        })
    );
});


const deactivateAccessBadge = asyncHandler(async (req, res) => {
    const { deactivation_reason, remarks } = req.body;

    if (!deactivation_reason) {
        throw new ApiError(
            400,
            "deactivation_reason is required (STOLEN, DAMAGED, EMPLOYEE_LEFT, LOST, REPLACED, OTHER)"
        );
    }

    const badge = await AccessBadge.findById(req.params.id);
    if (!badge) {
        throw new ApiError(404, "Access badge not found");
    }

    if (badge.status !== "ACTIVE") {
        throw new ApiError(
            400,
            `Badge is already ${badge.status.toLowerCase()} and cannot be deactivated again`
        );
    }

    const statusMap = {
        STOLEN:        "CANCELLED",
        DAMAGED:       "INACTIVE",
        EMPLOYEE_LEFT: "INACTIVE",
        LOST:          "LOST",
        REPLACED:      "INACTIVE",
        OTHER:         "INACTIVE",
    };

    badge.status               = statusMap[deactivation_reason] || "INACTIVE";
    badge.deactivation_reason  = deactivation_reason;
    badge.deactivated_at       = new Date();
    if (remarks !== undefined) badge.remarks = remarks;

    await badge.save();

    await Tenant.findByIdAndUpdate(badge.tenant_id, {
        $inc: {
            "card_quota.active_cards":      -1,
            "card_quota.deactivated_cards":  1,
        },
    });

    const updated = await AccessBadge.findById(badge._id)
        .populate({
            path: "employee_id",
            select: "full_name id_card_number job_title",
        })
        .populate({
            path: "tenant_id",
            select: "company_name qb_code card_quota",
        });

    return res
        .status(200)
        .json(new ApiResponse(200, "Access badge deactivated successfully", updated));
});

export {
    issueAccessBadge,
    getAllAccessBadges,
    getAccessBadgeById,
    getEmployeeBadgeHistory,
    deactivateAccessBadge,
};