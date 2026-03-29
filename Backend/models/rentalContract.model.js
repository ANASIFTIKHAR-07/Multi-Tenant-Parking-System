import mongoose, { Schema } from "mongoose";

const rentalContractSchema = new Schema(
  {
    tenant_id: { type: Schema.Types.ObjectId, ref: "Tenant", required: true },

    contract_ref_number: { type: String, required: true, unique: true },
    company_name: { type: String, required: true },
    floor: { type: String },
    unit: { type: String },

    slots_allocated: { type: Number, required: true },
    slots_used: { type: Number, default: 0 },

    duration_months: { type: Number, required: true },
    start_date: { type: Date, required: true },
    end_date: { type: Date, required: true },

    status: {
      type: String,
      enum: ["ACTIVE", "EXPIRED", "NEAR_EXPIRED", "CANCELLED"],
      default: "ACTIVE",
    },

    remarks: { type: String },
  },
  { timestamps: true }
);

rentalContractSchema.index({ tenant_id: 1 });
rentalContractSchema.index({ status: 1, end_date: 1 });
rentalContractSchema.index({ contract_ref_number: 1 }, { unique: true });

export const RentalContract = mongoose.models.RentalContract || mongoose.model("RentalContract", rentalContractSchema);
