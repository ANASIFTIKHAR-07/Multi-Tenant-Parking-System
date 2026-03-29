import mongoose, { Schema } from "mongoose";

const employeeSchema = new Schema(
  {
    tenant_id: { type: Schema.Types.ObjectId, ref: "Tenant", required: true },

    full_name: { type: String, required: true },
    id_card_number: { type: String },

    job_title: { type: String },

    vehicles: [
      {
        car_plate_number: { type: String, required: true },
        sticker_number: { type: String },
        car_tag: { type: Number },
        is_primary: { type: Boolean, default: false },
      },
    ],

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },

    remarks: { type: String },
  },
  { timestamps: true }
);

employeeSchema.index({ tenant_id: 1 });
employeeSchema.index({ full_name: "text" });
employeeSchema.index({ id_card_number: 1 }, { sparse: true });
employeeSchema.index({ "vehicles.car_plate_number": 1 });

export const Employee = mongoose.models.Employee || mongoose.model("Employee", employeeSchema);
