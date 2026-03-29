// import { asyncHandler } from "../utils/asyncHandler.js";
// import { ApiError } from "../utils/ApiError.js";
// import { ApiResponse } from "../utils/ApiResponse.js";
// import { Vehicle } from "../models/vehicle.model.js";
// import { ParkingSlot } from "../models/parkingSlot.model.js";

// const checkInVehicle = asyncHandler(async (req, res) => {
//   const { plateNumber, ownerName, rfNumber, company, floor } = req.body;

//   if (!plateNumber || !ownerName || !rfNumber || !company || !floor) {
//     throw new ApiError(400, "All fields are required!!");
//   }

//   const existing = await Vehicle.findOne({ rfNumber, checkOutTime: null });

//   if (existing) {
//     throw new ApiError(400, "Vehicle with this RFID already exists.");
//   }

//   const freeSlot = await ParkingSlot.findOne({ isOccupied: false, floor });

//   if (!freeSlot) {
//     throw new ApiError(404, "No free slot available on this floor.");
//   }

//   freeSlot.isOccupied = true;
//   await freeSlot.save();

//   const vehicle = await Vehicle.create({
//     plateNumber,
//     ownerName,
//     rfNumber,
//     company,
//     floor,
//     slot: freeSlot._id,
//   });

//   res
//     .status(201)
//     .json(new ApiResponse(201, vehicle, "Vehicle checked in successfully."));
// });

// const checkOutVehicle = asyncHandler(async (req, res) => {
//   const { rfNumber } = req.body;

//   if (!rfNumber) {
//     throw new ApiError(400, "RFID Number is required.");
//   }

//   const vehicle = await Vehicle.findOne({ rfNumber, checkOutTime: null });

//   if (!vehicle) {
//     throw new ApiError(404, "No active vehicle found with this RFID.");
//   }

//   const slot = await ParkingSlot.findById(vehicle.slot);
//   if (slot) {
//     slot.isOccupied = false;
//     await slot.save();
//   }

//   vehicle.checkOutTime = new Date();
//   await vehicle.save();

//   res
//     .status(200)
//     .json(new ApiResponse(200, vehicle, "Vehicle checked out successfully."));
// });
// export {
//     checkInVehicle, 
//     checkOutVehicle,
// };
