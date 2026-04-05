import { createObjectCsvStringifier } from "csv-writer";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ParkingRecord } from "../models/parkingRecord.model.js";
import { Tenant } from "../models/tenant.model.js";
import { AccessBadge } from "../models/accessBadge.model.js";
import { RentalContract } from "../models/rentalContract.model.js";
import { Unit } from "../models/unit.model.js";


const sendCSV = (res, filename, headers, records) => {
    const csvStringifier = createObjectCsvStringifier({ header: headers });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
        "Content-Disposition",
        `attachment; filename=${filename}_${new Date().toISOString().split("T")[0]}.csv`
    );

    res.send(
        csvStringifier.getHeaderString() +
        csvStringifier.stringifyRecords(records)
    );
};


export const exportParkingRecords = asyncHandler(async (req, res) => {
    const filter = {};
    if (req.query.tenant_id)    filter.tenant_id    = req.query.tenant_id;
    if (req.query.parking_type) filter.parking_type = req.query.parking_type;
    if (req.query.status)       filter.status       = req.query.status;

    if (req.query.floor) {
        const units = await Unit.find({ floor: req.query.floor }).select("_id");
        const unitIds = units.map((u) => u._id);
        const tenants = await Tenant.find({
            unit_id: { $in: unitIds },
        }).select("_id");
        filter.tenant_id = { $in: tenants.map((t) => t._id) };
    }

    const records = await ParkingRecord.find(filter)
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
            select: "contract_ref_number",
        })
        .sort({ createdAt: -1 });

    if (!records.length) {
        throw new ApiError(404, "No parking records found to export");
    }

    const headers = [
        { id: "employee_name",       title: "Employee Name" },
        { id: "id_card_number",      title: "ID Card Number" },
        { id: "job_title",           title: "Job Title" },
        { id: "company_name",        title: "Company" },
        { id: "qb_code",             title: "QB Code" },
        { id: "floor",               title: "Floor" },
        { id: "unit_number",         title: "Unit" },
        { id: "car_plate_number",    title: "Car Plate No" },
        { id: "sticker_number",      title: "Sticker No" },
        { id: "car_tag",             title: "Car Tag" },
        { id: "badge_id",            title: "Badge ID" },
        { id: "parking_type",        title: "Parking Type" },
        { id: "sr_number",           title: "SR Number" },
        { id: "slot_code",           title: "Assigned Slot" },
        { id: "slot_floor",          title: "Slot Floor" },
        { id: "contract_ref",        title: "Contract Ref No" },
        { id: "status",              title: "Status" },
        { id: "assigned_at",         title: "Assigned Date" },
        { id: "cancelled_at",        title: "Cancelled Date" },
        { id: "remarks",             title: "Remarks" },
    ];

    const csvData = records.map((r) => ({
        employee_name:    r.employee_id?.full_name                    || "",
        id_card_number:   r.employee_id?.id_card_number               || "",
        job_title:        r.employee_id?.job_title                    || "",
        company_name:     r.tenant_id?.company_name                   || "",
        qb_code:          r.tenant_id?.qb_code                        || "",
        floor:            r.tenant_id?.unit_id?.floor                 || "",
        unit_number:      r.tenant_id?.unit_id?.unit_number           || "",
        car_plate_number: r.car_plate_number                          || "",
        sticker_number:   r.sticker_number                            || "",
        car_tag:          r.car_tag                                   || "",
        badge_id:         r.badge_id                                  || "",
        parking_type:     r.parking_type                              || "",
        sr_number:        r.sr_number                                 || "",
        slot_code:        r.assigned_slot?.slot_code                  || "",
        slot_floor:       r.assigned_slot?.floor_number               || "",
        contract_ref:     r.rental_contract_id?.contract_ref_number   || "",
        status:           r.status                                    || "",
        assigned_at:      r.assigned_at?.toISOString().split("T")[0]  || "",
        cancelled_at:     r.cancelled_at?.toISOString().split("T")[0] || "",
        remarks:          r.remarks                                   || "",
    }));

    sendCSV(res, "parking_records", headers, csvData);
});


export const exportTenants = asyncHandler(async (req, res) => {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    if (req.query.floor) {
        const units = await Unit.find({ floor: req.query.floor }).select("_id");
        filter.unit_id = { $in: units.map((u) => u._id) };
    }

    const tenants = await Tenant.find(filter)
        .populate({
            path: "unit_id",
            select: "floor unit_number zone unit_space_sqm max_card_limit owner",
        })
        .sort({ createdAt: -1 });

    if (!tenants.length) {
        throw new ApiError(404, "No tenants found to export");
    }

    const headers = [
        { id: "company_name",           title: "Company Name" },
        { id: "qb_code",                title: "QB Code" },
        { id: "floor",                  title: "Floor" },
        { id: "unit_number",            title: "Unit" },
        { id: "zone",                   title: "Zone" },
        { id: "unit_space_sqm",         title: "Unit Space (sqm)" },
        { id: "owner_name",             title: "Owner Name" },
        { id: "owner_qb_code",          title: "Owner QB Code" },
        { id: "max_card_limit",         title: "Max Card Limit" },
        { id: "active_cards",           title: "Active Cards" },
        { id: "deactivated_cards",      title: "Deactivated Cards" },
        { id: "assigned_allocated",     title: "Assigned Parking Allocated" },
        { id: "assigned_used",          title: "Assigned Parking Used" },
        { id: "assigned_remaining",     title: "Assigned Parking Remaining" },
        { id: "pool_allocated",         title: "Pool Parking Allocated" },
        { id: "pool_used",              title: "Pool Parking Used" },
        { id: "pool_remaining",         title: "Pool Parking Remaining" },
        { id: "rental_allocated",       title: "Rental Parking Allocated" },
        { id: "rental_used",            title: "Rental Parking Used" },
        { id: "rental_remaining",       title: "Rental Parking Remaining" },
        { id: "visitor_card_quota",     title: "Visitor Card Quota" },
        { id: "status",                 title: "Status" },
        { id: "lease_start",            title: "Lease Start" },
        { id: "lease_end",              title: "Lease End" },
        { id: "remarks",                title: "Remarks" },
    ];

    const csvData = tenants.map((t) => ({
        company_name:       t.company_name                                                        || "",
        qb_code:            t.qb_code                                                            || "",
        floor:              t.unit_id?.floor                                                      || "",
        unit_number:        t.unit_id?.unit_number                                                || "",
        zone:               t.unit_id?.zone                                                       || "",
        unit_space_sqm:     t.unit_id?.unit_space_sqm                                             || "",
        owner_name:         t.unit_id?.owner?.name                                                || "",
        owner_qb_code:      t.unit_id?.owner?.qb_code                                             || "",
        max_card_limit:     t.card_quota?.max_limit                                               || 0,
        active_cards:       t.card_quota?.active_cards                                            || 0,
        deactivated_cards:  t.card_quota?.deactivated_cards                                       || 0,
        assigned_allocated: t.parking_quota?.assigned?.allocated                                  || 0,
        assigned_used:      t.parking_quota?.assigned?.used                                       || 0,
        assigned_remaining: (t.parking_quota?.assigned?.allocated || 0) - (t.parking_quota?.assigned?.used || 0),
        pool_allocated:     t.parking_quota?.pool?.allocated                                      || 0,
        pool_used:          t.parking_quota?.pool?.used                                           || 0,
        pool_remaining:     (t.parking_quota?.pool?.allocated || 0) - (t.parking_quota?.pool?.used || 0),
        rental_allocated:   t.parking_quota?.rental?.allocated                                    || 0,
        rental_used:        t.parking_quota?.rental?.used                                         || 0,
        rental_remaining:   (t.parking_quota?.rental?.allocated || 0) - (t.parking_quota?.rental?.used || 0),
        visitor_card_quota: t.visitor_card_quota                                                  || 0,
        status:             t.status                                                              || "",
        lease_start:        t.lease_start?.toISOString().split("T")[0]                            || "",
        lease_end:          t.lease_end?.toISOString().split("T")[0]                              || "",
        remarks:            t.remarks                                                             || "",
    }));

    sendCSV(res, "tenants", headers, csvData);
});


export const exportAccessBadges = asyncHandler(async (req, res) => {
    const filter = {};
    if (req.query.tenant_id) filter.tenant_id = req.query.tenant_id;
    if (req.query.status)    filter.status    = req.query.status;

    const badges = await AccessBadge.find(filter)
        .populate({
            path: "employee_id",
            select: "full_name id_card_number job_title",
        })
        .populate({
            path: "tenant_id",
            select: "company_name qb_code",
            populate: {
                path: "unit_id",
                select: "floor unit_number",
            },
        })
        .sort({ createdAt: -1 });

    if (!badges.length) {
        throw new ApiError(404, "No access badges found to export");
    }

    const headers = [
        { id: "employee_name",        title: "Employee Name" },
        { id: "id_card_number",       title: "ID Card Number" },
        { id: "job_title",            title: "Job Title" },
        { id: "company_name",         title: "Company" },
        { id: "qb_code",              title: "QB Code" },
        { id: "floor",                title: "Floor" },
        { id: "unit_number",          title: "Unit" },
        { id: "badge_number",         title: "Badge Number" },
        { id: "sr_number",            title: "SR Number" },
        { id: "sr_number_secondary",  title: "SR Number Secondary" },
        { id: "access_level",         title: "Access Level" },
        { id: "status",               title: "Status" },
        { id: "issued_at",            title: "Issued Date" },
        { id: "deactivated_at",       title: "Deactivated Date" },
        { id: "deactivation_reason",  title: "Deactivation Reason" },
        { id: "remarks",              title: "Remarks" },
    ];

    const csvData = badges.map((b) => ({
        employee_name:       b.employee_id?.full_name                      || "",
        id_card_number:      b.employee_id?.id_card_number                 || "",
        job_title:           b.employee_id?.job_title                      || "",
        company_name:        b.tenant_id?.company_name                     || "",
        qb_code:             b.tenant_id?.qb_code                          || "",
        floor:               b.tenant_id?.unit_id?.floor                   || "",
        unit_number:         b.tenant_id?.unit_id?.unit_number             || "",
        badge_number:        b.badge_number                                || "",
        sr_number:           b.sr_number                                   || "",
        sr_number_secondary: b.sr_number_secondary                         || "",
        access_level:        b.access_level                                || "",
        status:              b.status                                      || "",
        issued_at:           b.issued_at?.toISOString().split("T")[0]      || "",
        deactivated_at:      b.deactivated_at?.toISOString().split("T")[0] || "",
        deactivation_reason: b.deactivation_reason                         || "",
        remarks:             b.remarks                                     || "",
    }));

    sendCSV(res, "access_badges", headers, csvData);
});


export const exportRentalContracts = asyncHandler(async (req, res) => {
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

    const contracts = await RentalContract.find(filter)
        .populate({
            path: "tenant_id",
            select: "company_name qb_code",
            populate: {
                path: "unit_id",
                select: "floor unit_number zone",
            },
        })
        .sort({ createdAt: -1 });

    if (!contracts.length) {
        throw new ApiError(404, "No rental contracts found to export");
    }

    const headers = [
        { id: "company_name",       title: "Company Name" },
        { id: "qb_code",            title: "QB Code" },
        { id: "floor",              title: "Floor" },
        { id: "unit_number",        title: "Unit" },
        { id: "contract_ref",       title: "Contract Ref No" },
        { id: "slots_allocated",    title: "Slots Allocated" },
        { id: "slots_used",         title: "Slots Used" },
        { id: "slots_remaining",    title: "Slots Remaining" },
        { id: "duration_months",    title: "Duration (Months)" },
        { id: "start_date",         title: "Start Date" },
        { id: "end_date",           title: "End Date" },
        { id: "days_until_expiry",  title: "Days Until Expiry" },
        { id: "status",             title: "Status" },
        { id: "remarks",            title: "Remarks" },
    ];

    const csvData = contracts.map((c) => ({
        company_name:      c.company_name                                || "",
        qb_code:           c.tenant_id?.qb_code                          || "",
        floor:             c.floor || c.tenant_id?.unit_id?.floor        || "",
        unit_number:       c.unit  || c.tenant_id?.unit_id?.unit_number  || "",
        contract_ref:      c.contract_ref_number                         || "",
        slots_allocated:   c.slots_allocated                             || 0,
        slots_used:        c.slots_used                                  || 0,
        slots_remaining:   (c.slots_allocated || 0) - (c.slots_used || 0),
        duration_months:   c.duration_months                             || "",
        start_date:        c.start_date?.toISOString().split("T")[0]     || "",
        end_date:          c.end_date?.toISOString().split("T")[0]       || "",
        days_until_expiry: Math.ceil(
            (new Date(c.end_date) - new Date()) / (1000 * 60 * 60 * 24)
        ),
        status:            c.status                                      || "",
        remarks:           c.remarks                                     || "",
    }));

    sendCSV(res, "rental_contracts", headers, csvData);
});