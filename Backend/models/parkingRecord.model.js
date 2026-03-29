import mongoose, { Schema } from "mongoose";

const parkingRecordSchema = new Schema(
  {
    employee_id: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    tenant_id: { type: Schema.Types.ObjectId, ref: "Tenant", required: true },

    rental_contract_id: {
      type: Schema.Types.ObjectId,
      ref: "RentalContract",
      default: null,
    },

    badge_id: { type: Number },
    car_plate_number: { type: String, required: true },
    sticker_number: { type: String },
    car_tag: { type: Number },

    parking_type: {
      type: String,
      enum: ["ASSIGNED", "POOL", "RENTAL"],
      required: true,
    },

    sr_number: { type: String },

    assigned_slot: {
      slot_code: { type: String },
      floor_number: { type: String },
    },

    status: {
      type: String,
      enum: ["ACTIVE", "CANCELLED"],
      default: "ACTIVE",
    },

    assigned_at: { type: Date, default: Date.now },
    cancelled_at: { type: Date },
    remarks: { type: String },
  },
  { timestamps: true }
);

parkingRecordSchema.index({ employee_id: 1 });
parkingRecordSchema.index({ tenant_id: 1, parking_type: 1, status: 1 });
parkingRecordSchema.index({ rental_contract_id: 1 }, { sparse: true });
parkingRecordSchema.index({ car_plate_number: 1 });
parkingRecordSchema.index({ "assigned_slot.slot_code": 1 }, { sparse: true });

export const ParkingRecord = mongoose.models.ParkingRecord || mongoose.model("ParkingRecord", parkingRecordSchema);
