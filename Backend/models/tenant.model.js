import mongoose, { Schema } from "mongoose";

const tenantSchema = new Schema(
  {
    unit_id: { type: Schema.Types.ObjectId, ref: "Unit", required: true },
    qb_code: { type: String },
    company_name: { type: String, required: true },

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "TERMINATED"],
      default: "ACTIVE",
    },
    lease_start: { type: Date },
    lease_end: { type: Date },

    card_quota: {
      max_limit: { type: Number },
      active_cards: { type: Number, default: 0 },
      deactivated_cards: { type: Number, default: 0 },
    },

    parking_quota: {
      assigned: {
        allocated: { type: Number, default: 0 },
        used: { type: Number, default: 0 },
      },
      pool: {
        allocated: { type: Number, default: 0 },
        used: { type: Number, default: 0 },
      },
      rental: {
        allocated: { type: Number, default: 0 },
        used: { type: Number, default: 0 },
      },
    },

    visitor_card_quota: { type: Number, default: 0 },

    remarks: { type: String },
  },
  { timestamps: true }
);

tenantSchema.index({ unit_id: 1 });
tenantSchema.index({ company_name: "text" });
tenantSchema.index({ qb_code: 1 });

export const Tenant = mongoose.models.Tenant || mongoose.model("Tenant", tenantSchema);
