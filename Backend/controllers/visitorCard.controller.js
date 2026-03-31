import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { VisitorCard } from "../models/visitorCard.model.js";
import { Tenant } from "../models/tenant.model.js";


const getFullVisitorCard = async (cardId) => {
    return await VisitorCard.findById(cardId).populate({
        path: "tenant_id",
        select: "company_name qb_code visitor_card_quota",
        populate: {
            path: "unit_id",
            select: "floor unit_number zone",
        },
    });
};


const issueVisitorCard = asyncHandler(async (req, res) => {
    const {
        tenant_id,
        badge_number,
        remarks,
    } = req.body;

    if (!tenant_id || !badge_number) {
        throw new ApiError(400, "tenant_id and badge_number are required");
    }

    const tenant = await Tenant.findById(tenant_id);
    if (!tenant) {
        throw new ApiError(404, "Tenant not found");
    }
    if (tenant.status !== "ACTIVE") {
        throw new ApiError(
            400,
            "Cannot issue a visitor card to an inactive tenant"
        );
    }

    
    const currentCardCount = await VisitorCard.countDocuments({
        tenant_id,
        status: { $in: ["AVAILABLE", "IN_USE"] },
    });

    if (currentCardCount >= tenant.visitor_card_quota) {
        throw new ApiError(
            400,
            `Visitor card quota exceeded. ${tenant.company_name} is allocated ${tenant.visitor_card_quota} visitor card(s) and all are active`
        );
    }

    const duplicate = await VisitorCard.findOne({ badge_number });
    if (duplicate) {
        throw new ApiError(
            409,
            `Visitor card with badge number ${badge_number} already exists`
        );
    }

    const card = await VisitorCard.create({
        tenant_id,
        badge_number,
        status:    "AVAILABLE",
        issued_at: new Date(),
        remarks:   remarks || null,
    });

    const populated = await getFullVisitorCard(card._id);

    return res
        .status(201)
        .json(
            new ApiResponse(201, "Visitor card issued successfully", populated)
        );
});


const getAllVisitorCards = asyncHandler(async (req, res) => {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 10);
    const skip  = (page - 1) * limit;

    const filter = {};
    if (req.query.tenant_id) filter.tenant_id = req.query.tenant_id;
    if (req.query.status)    filter.status    = req.query.status;

    const [cards, total] = await Promise.all([
        VisitorCard.find(filter)
            .populate({
                path: "tenant_id",
                select: "company_name qb_code visitor_card_quota",
                populate: {
                    path: "unit_id",
                    select: "floor unit_number zone",
                },
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        VisitorCard.countDocuments(filter),
    ]);

    return res.status(200).json(
        new ApiResponse(200, "Visitor cards fetched successfully", {
            cards,
            pagination: {
                total,
                page,
                limit,
                total_pages: Math.ceil(total / limit),
            },
        })
    );
});

const getVisitorCardById = asyncHandler(async (req, res) => {
    const card = await getFullVisitorCard(req.params.id);

    if (!card) {
        throw new ApiError(404, "Visitor card not found");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, "Visitor card fetched successfully", card)
        );
});


const checkInVisitor = asyncHandler(async (req, res) => {
    const card = await VisitorCard.findById(req.params.id);

    if (!card) {
        throw new ApiError(404, "Visitor card not found");
    }

    if (card.status === "IN_USE") {
        throw new ApiError(
            400,
            "This visitor card is already checked out with a visitor"
        );
    }

    if (card.status === "DEACTIVATED") {
        throw new ApiError(400, "This visitor card has been deactivated");
    }

    if (card.status === "LOST") {
        throw new ApiError(400, "This visitor card is marked as lost");
    }

    card.status = "IN_USE";
    await card.save();

    const populated = await getFullVisitorCard(card._id);

    return res
        .status(200)
        .json(
            new ApiResponse(200, "Visitor checked in successfully", populated)
        );
});


const checkOutVisitor = asyncHandler(async (req, res) => {
    const card = await VisitorCard.findById(req.params.id);

    if (!card) {
        throw new ApiError(404, "Visitor card not found");
    }

    if (card.status !== "IN_USE") {
        throw new ApiError(
            400,
            `Cannot check out. Card is currently ${card.status.toLowerCase()}, not in use`
        );
    }

    card.status = "AVAILABLE";
    await card.save();

    const populated = await getFullVisitorCard(card._id);

    return res
        .status(200)
        .json(
            new ApiResponse(200, "Visitor checked out successfully", populated)
        );
});


const deactivateVisitorCard = asyncHandler(async (req, res) => {
    const { deactivation_reason, remarks } = req.body;

    if (!deactivation_reason) {
        throw new ApiError(
            400,
            "deactivation_reason is required (LOST, DAMAGED, OTHER)"
        );
    }

    const validReasons = ["LOST", "DAMAGED", "OTHER"];
    if (!validReasons.includes(deactivation_reason)) {
        throw new ApiError(
            400,
            `deactivation_reason must be one of: ${validReasons.join(", ")}`
        );
    }

    const card = await VisitorCard.findById(req.params.id);
    if (!card) {
        throw new ApiError(404, "Visitor card not found");
    }

    if (card.status === "DEACTIVATED") {
        throw new ApiError(400, "Visitor card is already deactivated");
    }

    if (card.status === "IN_USE") {
        throw new ApiError(
            400,
            "Cannot deactivate. This card is currently checked out with a visitor. Retrieve the card and check it out first."
        );
    }

    card.status              = deactivation_reason === "LOST" ? "LOST" : "DEACTIVATED";
    card.deactivated_at      = new Date();
    card.deactivation_reason = deactivation_reason;
    if (remarks !== undefined) card.remarks = remarks;

    await card.save();

    const populated = await getFullVisitorCard(card._id);

    return res
        .status(200)
        .json(
            new ApiResponse(200, "Visitor card deactivated successfully", populated)
        );
});

export {
    issueVisitorCard,
    getAllVisitorCards,
    getVisitorCardById,
    checkInVisitor,
    checkOutVisitor,
    deactivateVisitorCard,
};