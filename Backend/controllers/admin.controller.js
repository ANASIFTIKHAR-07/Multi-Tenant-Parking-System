import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Company } from "../models/company.model.js";
import { Floor } from "../models/floor.model.js";
import { ParkingSlot } from "../models/parkingSlot.model.js";
import { ParkingLog } from "../models/parkingLog.model.js";

const addCompany = asyncHandler(async (req, res) => {
  const { name, email, phone } = req.body;

  if (!name || !email || !phone) {
    throw new ApiError(400, "All Fields are required for adding the company!");
  }

  const existingCompany = await Company.findOne({ email });

  if (existingCompany) {
    throw new ApiError(400, "The company already exists!");
  }

  const company = await Company.create({
    name,
    email,
    phone,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Company Created Successfully", company));
});

const getAllCompanies = asyncHandler(async (req, res) => {
  const companies = await Company.find()
    .populate('assignedFloors', 'floorNumber') // Add this line
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, "All Companies Fetched.", companies));
});

const updateCompany = asyncHandler(async (req, res) => {
  const updates = req.body;

  const company = await Company.findByIdAndUpdate(
    { _id: req.params.id },
    updates,
    { new: true }
  ).select("-refreshToken");

  if (!company) {
    throw new ApiError(404, "Company Not Found.");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Company Details Updated Successfully.", company,)
    );
});

const deleteCompany = asyncHandler(async (req, res) => {
  const company = await Company.findByIdAndDelete({
    _id: req.params.id,
  });

  if (!company) {
    throw new ApiError(404, "Company Not Found.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Company Deleted Successfully.", {}));
});

const createFloor = asyncHandler(async (req, res) => {
  const { floorNumber, totalSlots } = req.body;

  if (!floorNumber || !totalSlots) {
    throw new ApiError(400, "All fields are required!");
  }

  const existingFloor = await Floor.findOne({
    floorNumber,
  });

  if (existingFloor) {
    throw new ApiError(409, "Floor already exist with this number.");
  }

  const floor = await Floor.create({
    floorNumber,
    totalSlots,
    availableSlots: totalSlots,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, "Floor created successfully.", floor));
});

const getAllFloors = asyncHandler(async (req, res) => {
  const floors = await Floor.find()
    .populate("assignedCompany", "name email")
    .sort({ floorNumber: 1 });

  return res
    .status(200)
    .json(new ApiResponse(200, "All floors fetched.", floors));
});

const deleteFloor = asyncHandler(async (req, res) => {
  const floor = await Floor.findByIdAndDelete({
    _id: req.params.id,
  });

  if (!floor) {
    throw new ApiError(404, "Floor not found.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Floor deleted successfully.", {}));
});

const updateFloor = asyncHandler(async (req, res) => {
  const updates = req.body;
  const floor = await Floor.findByIdAndUpdate(req.params.id, updates, {
    new: true,
  }).populate("assignedCompany", "name email");

  if (!floor) {
    throw new ApiError(404, "Floor not found!");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Floor updated successfully.", floor));
});

const createParkingSlot = asyncHandler(async (req, res) => {
  const { floorId, slots } = req.body;

  if (!floorId || !Array.isArray(slots) || slots.length === 0) {
    throw new ApiError(
      400,
      "floorId and a non-empty slots array are required."
    );
  }

  const floor = await Floor.findById(floorId).populate("assignedCompany");
  if (!floor) {
    throw new ApiError(404, "Floor not found.");
  }

  const newSlots = slots.map((slot) => ({
    slotNumber: slot.slotNumber,
    floor: floor._id,
    company: floor.assignedCompany?._id || null,
    employee: slot.employee || null,
  }));

  const createdSlots = await ParkingSlot.insertMany(newSlots);

  floor.totalSlots += createdSlots.length;
  await floor.save();

  return res
    .status(201)  
    .json(
      new ApiResponse(201, "Parking slots created successfully.", createdSlots)
    );
});

const getParkingSlots = asyncHandler(async (req, res) => {
  const { floorId, companyId, assigned } = req.query;
  const filter = {};

  if (floorId) filter.floor = floorId;
  if (companyId) filter.company = companyId;
  if (assigned !== undefined) {
    filter.employee = assigned === "true" ? { $ne: null } : null;
  }

  const slots = await ParkingSlot.find(filter)
    .populate("floor", "floorNumber")
    .populate("company", "name");

  return res
    .status(200)
    .json(new ApiResponse(200, "Parking slots fetched successfully.", slots));
});

const updateParkingSlot = asyncHandler(async (req, res) => {
  const { employee } = req.body; // pass employee object or null to unassign

  // 1️⃣ Get current slot without updating
  const slot = await ParkingSlot.findById(req.params.id)
    .populate("floor", "floorNumber")
    .populate("company", "name");

  if (!slot) {
    throw new ApiError(404, "Parking slot not found.");
  }

  // 2️⃣ If trying to assign a new employee, validate
  if (employee) {
    // Validate employee object structure
    if (!employee.name || !employee.vehicleNumber || !employee.rfid) {
      throw new ApiError(400, "Employee must have name, vehicleNumber, and rfid.");
    }

    // Prevent overwriting without unassigning first
    if (slot.employee && slot.employee.rfid !== employee.rfid) {
      throw new ApiError(
        400,
        "Slot is already occupied. Unassign before reassigning."
      );
    }

    // Prevent same employee (by RFID) having multiple slots
    const existing = await ParkingSlot.findOne({ "employee.rfid": employee.rfid });
    if (existing && existing._id.toString() !== req.params.id) {
      throw new ApiError(400, "Employee with this RFID already has a parking slot.");
    }
  }

  // 3️⃣ Perform the actual update
  slot.employee = employee || null;
  await slot.save();

  return res
    .status(200)
    .json(new ApiResponse(200, "Parking slot updated successfully.", slot));
});

const deleteParkingSlot = asyncHandler(async (req, res) => {
  const slot = await ParkingSlot.findByIdAndDelete(req.params.id);

  if (!slot) {
    throw new ApiError(404, "Parking slot not found.");
  }

  // Decrement slot count on floor
  const floor = await Floor.findById(slot.floor);
  if (floor) {
    floor.totalSlots = Math.max(0, floor.totalSlots - 1);
    await floor.save();
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Parking slot deleted successfully.",  {}));
});

const getParkingLogs = asyncHandler(async (req, res) => {
  const {
    company,
    vehicleNumber,
    floor,
    slotNumber,
    employeeName,
    rfid,
    startDate,
    endDate,
  } = req.query;

  let filters = {};

  if (company) filters.company = company;
  if (vehicleNumber)
    filters.vehicleNumber = { $regex: vehicleNumber, $options: "i" };
  if (floor) filters.floor = floor;
  if (slotNumber) filters.slotNumber = { $regex: slotNumber, $options: "i" };
  if (employeeName)
    filters.employeeName = { $regex: employeeName, $options: "i" };
  if (rfid) filters.rfidTag = rfid;

  // Date range filter
  if (startDate || endDate) {
    filters.createdAt = {};
    if (startDate) filters.createdAt.$gte = new Date(startDate);
    if (endDate) filters.createdAt.$lte = new Date(endDate);
  }

  const logs = await ParkingLog.find(filters)
    .populate("company", "name")
    .populate("floor", "floorNumber")
    .sort({ createdAt: -1 });

  if (!logs.length) {
    throw new ApiError(404, "No parking logs found with the given filters.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Parking logs retrieved successfully.", logs));
});

const assignCompanyToFloor = asyncHandler(async (req, res) => {
  const { companyId, floorId } = req.body;

  const company = await Company.findById(companyId).populate(
    "assignedFloors",
    "floorNumber"
  );
  const floor = await Floor.findById(floorId).populate(
    "assignedCompany",
    "name email"
  );

  if (!company) throw new ApiError(404, "Company not found");
  if (!floor) throw new ApiError(404, "Floor not found");

  // Prevent duplicates
  if (floor.assignedCompany && floor.assignedCompany.toString() !== companyId) {
    throw new ApiError(
      400,
      "This floor is already assigned to another company"
    );
  }

  floor.assignedCompany = companyId;
  await floor.save();

  if (!company.assignedFloors.includes(floorId)) {
    company.assignedFloors.push(floorId);
    await company.save();
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, "Company Assigned to Floor successfully.", {
        company,
        floor,
      })
    );
});

export {
  // Company
  addCompany,
  getAllCompanies,
  updateCompany,
  deleteCompany,

  // Floor
  createFloor,
  getAllFloors,
  updateFloor,
  deleteFloor,

  // Parking Slot
  createParkingSlot,
  getParkingSlots,
  updateParkingSlot,
  deleteParkingSlot,

  // Parking Log
  getParkingLogs,

  // Company Assignment To Floor
  assignCompanyToFloor,
};
