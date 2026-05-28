import mongoose from "mongoose";

const incidentSchema = new mongoose.Schema(
  {
    assignment_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DispatchAssignment",
      required: true,
    },

    reported_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    incident_type: {
      type: String,
      enum: [
        "traffic",
        "accident",
        "vehicle_breakdown",
        "customer_issue",
        "other",
      ],
      default: "other",
    },

    description: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["reported", "processing", "resolved"],
      default: "reported",
    },

    resolved_at: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Incident", incidentSchema);