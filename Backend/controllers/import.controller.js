import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import * as xlsx from "xlsx";
import { Unit } from "../models/unit.model.js";
import { Tenant } from "../models/tenant.model.js";
import { Employee } from "../models/employee.model.js";
import { AccessBadge } from "../models/accessBadge.model.js";
import { ParkingRecord } from "../models/parkingRecord.model.js";
import { RentalContract } from "../models/rentalContract.model.js";

// Helper to normalize slightly variant column names
const getValue = (row, ...possibleKeys) => {
  for (const k of Object.keys(row)) {
    const cleanKey = k.trim().toLowerCase();
    if (possibleKeys.some((pK) => cleanKey.includes(pK.toLowerCase()))) {
      return row[k];
    }
  }
  return null;
};

export const masterImport = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "Please upload an Excel file (.xlsx)");
  }

  // 1. Parse Excel in RAM
  const workbook = xlsx.read(req.file.buffer, { type: "buffer" });

  let results = {
    units_processed: 0,
    tenants_processed: 0,
    employees_processed: 0,
    badges_processed: 0,
    parking_processed: 0,
    contracts_processed: 0,
  };

  try {
    // 2. Data Accumulators (to avoid duplicate processing overhead)
    const activeTenants = new Map(); // name -> tenant object
    const activeUnits = new Map(); // key -> unit object
    const activeEmployees = new Map(); // name -> employee object
    const activeContracts = new Map(); // ref -> contract object

    // ──────────────────────────────────────────────
    // PASS 1: TENANTS & EMPLOYEES & BADGES (From T-Card & W-* Sheets)
    // ──────────────────────────────────────────────
    for (const sheetName of workbook.SheetNames) {
      if (
        sheetName.startsWith("T-Card") ||
        sheetName.startsWith("W-") ||
        sheetName.includes("M & C")
      ) {
        const rows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
        for (const row of rows) {
          const companyStr = getValue(row, "Company", "Tenant Customer");
          const occupantName = getValue(row, "Occupant");
          const floorStr = getValue(row, "Floor");
          let unitStr = getValue(row, "Unit");
          const badgeNum = getValue(row, "Active Badge", "Badge ID");
          const srNum = getValue(row, "Sr-Active");

          if (!companyStr) continue;

          // Process Unit
          let unitId = null;
          if (floorStr && unitStr) {
            const unitKey = `${String(floorStr).trim()}-${String(unitStr).trim()}`;
            if (!activeUnits.has(unitKey)) {
              let unit = await Unit.findOne({ floor: String(floorStr).trim(), unit_number: String(unitStr).trim() });
              if (!unit) {
                unit = await Unit.create({
                  floor: String(floorStr).trim(),
                  unit_number: String(unitStr).trim(),
                  unit_space_sqm: 10, // Default if space missing
                  max_card_limit: 5,
                  owner: { name: companyStr }, // default to company
                });
                results.units_processed++;
              }
              activeUnits.set(unitKey, unit);
            }
            unitId = activeUnits.get(unitKey)._id;
          }

          // Process Tenant
          const companyClean = companyStr.trim();
          if (!activeTenants.has(companyClean)) {
            let tenant = await Tenant.findOne({ company_name: companyClean });
            if (!tenant) {
              tenant = await Tenant.create({
                company_name: companyClean,
                unit_id: unitId || (await Unit.findOne().select("_id")), // fallback unit if missing
                status: "ACTIVE",
              });
              results.tenants_processed++;
            }
            activeTenants.set(companyClean, tenant);
          }
          const tenantObj = activeTenants.get(companyClean);

          // Process Employee & Badge
          if (occupantName) {
            const empClean = String(occupantName).trim();
            const empKey = `${tenantObj._id}_${empClean}`;
            if (!activeEmployees.has(empKey)) {
              let employee = await Employee.findOne({ full_name: empClean, tenant_id: tenantObj._id });
              if (!employee) {
                employee = await Employee.create({
                  tenant_id: tenantObj._id,
                  full_name: empClean,
                });
                results.employees_processed++;
              }
              activeEmployees.set(empKey, employee);
            }
            const empObj = activeEmployees.get(empKey);

            // Access Badge
            if (badgeNum) {
              const bNum = Number(badgeNum);
              if (!isNaN(bNum)) {
                let badge = await AccessBadge.findOne({ badge_number: bNum });
                if (!badge) {
                  await AccessBadge.create({
                    badge_number: bNum,
                    employee_id: empObj._id,
                    tenant_id: tenantObj._id,
                    sr_number: srNum ? String(srNum) : undefined,
                    status: "ACTIVE",
                  });
                  results.badges_processed++;
                }
              }
            }
          }
        }
      }
    }

    // ──────────────────────────────────────────────
    // PASS 2: RENTAL CONTRACTS 
    // ──────────────────────────────────────────────
    const rentalSheet = workbook.SheetNames.find(s => s.toLowerCase().includes("rental contract"));
    if (rentalSheet) {
      const rows = xlsx.utils.sheet_to_json(workbook.Sheets[rentalSheet]);
      for (const row of rows) {
        const refNo = getValue(row, "Contract Ref Number", "Contact Ref No");
        const companyStr = getValue(row, "Company Name");
        const allocatedStr = getValue(row, "Parking Slot Actual", "Allocated");
        
        if (refNo && companyStr && allocatedStr) {
          if (!activeContracts.has(String(refNo).trim())) {
            let contract = await RentalContract.findOne({ contract_ref_number: String(refNo).trim() });
            if (!contract) {
              const tenant = await Tenant.findOne({ company_name: String(companyStr).trim() });
              if (tenant) {
                contract = await RentalContract.create({
                  tenant_id: tenant._id,
                  company_name: tenant.company_name,
                  contract_ref_number: String(refNo).trim(),
                  slots_allocated: parseInt(allocatedStr) || 0,
                  duration_months: 12,
                  start_date: new Date(),
                  end_date: new Date(Date.now() + 31536000000), // +1 year fallback
                  status: "ACTIVE"
                });
                results.contracts_processed++;
              }
            }
            if (contract) activeContracts.set(String(refNo).trim(), contract);
          }
        }
      }
    }

    // ──────────────────────────────────────────────
    // PASS 3: PARKING RECORDS (From W-S-PARKING, Rental Prking, M-Parki)
    // ──────────────────────────────────────────────
    for (const sheetName of workbook.SheetNames) {
      if (
        sheetName.toLowerCase().includes("parking") || 
        sheetName.toLowerCase().includes("prking") ||
        sheetName.toLowerCase().includes("m-parki") ||
        sheetName.startsWith("W-S")
      ) {
        const rows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
        for (const row of rows) {
          const companyStr = getValue(row, "Company", "Tenant Customer");
          const occupantName = getValue(row, "Occupant");
          const plateNum = getValue(row, "Car Plate No");
          const pTypeStr = getValue(row, "Assign", "Pool", "Rental Parking") || "POOL";
          const refNo = getValue(row, "Contract Ref No");
          
          if (companyStr && plateNum && occupantName) {
            let parkingType = "POOL";
            if (String(pTypeStr).toLowerCase().includes("assign")) parkingType = "ASSIGNED";
            if (String(pTypeStr).toLowerCase().includes("rental") || refNo) parkingType = "RENTAL";

            const tenant = activeTenants.get(String(companyStr).trim());
            if (tenant) {
              const empKey = `${tenant._id}_${String(occupantName).trim()}`;
              const emp = activeEmployees.get(empKey);
              if (emp) {
                let pRec = await ParkingRecord.findOne({ car_plate_number: String(plateNum).trim() });
                if (!pRec) {
                  await ParkingRecord.create({
                    employee_id: emp._id,
                    tenant_id: tenant._id,
                    rental_contract_id: refNo ? activeContracts.get(String(refNo).trim())?._id : undefined,
                    car_plate_number: String(plateNum).trim(),
                    parking_type: parkingType,
                    status: "ACTIVE"
                  });
                  results.parking_processed++;
                }
              }
            }
          }
        }
      }
    }

    return res.status(200).json(
      new ApiResponse(200, results, "Master Data Synchronization Complete")
    );

  } catch (error) {
    console.error("ETL Engine Error:", error);
    throw new ApiError(500, `Import failed: ${error.message}`);
  }
});
