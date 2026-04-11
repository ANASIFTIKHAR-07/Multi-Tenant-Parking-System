import mongoose, { Schema } from "mongoose";

const accessBadgeSchema = new Schema(
  {
    employee_id: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    tenant_id: { type: Schema.Types.ObjectId, ref: "Tenant", required: true },

    badge_number: { type: Number, required: true, unique: true },
    sr_number: { type: String },
    sr_number_secondary: { type: Number },

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "CANCELLED", "LOST"],
      default: "ACTIVE",
    },

    // Simplified as requested
    access_level: { type: String, default: null },
    access_level_description: { type: String },

    issued_at: { type: Date, default: Date.now },
    deactivated_at: { type: Date },
    deactivation_reason: {
      type: String,
      enum: ["STOLEN", "DAMAGED", "EMPLOYEE_LEFT", "LOST", "REPLACED", "OTHER"],
    },

    remarks: { type: String },
  },
  { timestamps: true }
);

accessBadgeSchema.index({ employee_id: 1 });
accessBadgeSchema.index({ tenant_id: 1, status: 1 });
accessBadgeSchema.index({ sr_number: 1 }, { sparse: true });

export const AccessBadge = mongoose.models.AccessBadge || mongoose.model("AccessBadge", accessBadgeSchema);
