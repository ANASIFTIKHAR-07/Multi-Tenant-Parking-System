import mongoose, { Schema } from "mongoose";

const unitSchema = new Schema(
  {
    floor: { type: String, required: true },
    unit_number: { type: String, required: true },
    zone: { type: String },
    unit_space_sqm: { type: Number, required: true },
    max_card_limit: { type: Number, required: true }, // auto = Math.floor(unit_space_sqm / 9)
    owner: {
      qb_code: { type: String },
      name: { type: String, required: true },
    },
    remarks: { type: String },
  },
  { timestamps: true }
);

unitSchema.index({ floor: 1, unit_number: 1 }, { unique: true });

export const Unit = mongoose.models.Unit || mongoose.model("Unit", unitSchema);
