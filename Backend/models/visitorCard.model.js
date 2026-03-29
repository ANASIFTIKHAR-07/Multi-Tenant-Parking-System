import mongoose, { Schema } from "mongoose";

const visitorCardSchema = new Schema(
  {
    tenant_id: { type: Schema.Types.ObjectId, ref: "Tenant", required: true },

    badge_number: { type: Number, required: true, unique: true },

    status: {
      type: String,
      enum: ["AVAILABLE", "IN_USE", "LOST", "DEACTIVATED"],
      default: "AVAILABLE",
    },

    issued_at: { type: Date, default: Date.now },
    deactivated_at: { type: Date },
    deactivation_reason: {
      type: String,
      enum: ["LOST", "DAMAGED", "OTHER"],
    },

    usage_log: [
      {
        visitor_name: { type: String },
        visiting_company: { type: String },
        checked_in_at: { type: Date, required: true },
        checked_out_at: { type: Date, default: null },
        handled_by: { type: String },
        remarks: { type: String },
      },
    ],

    remarks: { type: String },
  },
  { timestamps: true }
);

visitorCardSchema.index({ tenant_id: 1, status: 1 });
visitorCardSchema.index({ badge_number: 1 }, { unique: true });

export const VisitorCard = mongoose.models.VisitorCard || mongoose.model("VisitorCard", visitorCardSchema);
