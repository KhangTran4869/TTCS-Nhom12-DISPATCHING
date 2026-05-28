import mongoose from "mongoose";

const routePointSchema = new mongoose.Schema(
  {
    sequence_no: {
      type: Number,
      required: true,
    },

    address: {
      type: String,
    },

    lat: {
      type: Number,
    },

    lng: {
      type: Number,
    },

    point_type: {
      type: String,
      enum: ["pickup", "waypoint", "delivery"],
      required: true,
    },
  },
  { _id: false },
);

const dispatchAssignmentSchema = new mongoose.Schema(
  {
    order_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },

    driver_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Driver",
      required: true,
    },

    vehicle_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
    },

    dispatcher_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    assignment_status: {
      type: String,
      enum: [
        "assigned",
        "accepted",
        "rejected",
        "in_progress",
        "completed",
        "cancelled",
      ],
      default: "assigned",
    },

    assigned_at: {
      type: Date,
      default: Date.now,
    },

    start_time: {
      type: Date,
    },

    end_time: {
      type: Date,
    },

    estimated_distance: {
      type: Number,
    },

    actual_distance: {
      type: Number,
    },

    estimated_duration: {
      type: Number,
    },

    actual_duration: {
      type: Number,
    },

    route_points: [routePointSchema],

    note: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("DispatchAssignment", dispatchAssignmentSchema);
