import mongoose from "mongoose";

const driverLocationSchema = new mongoose.Schema(
  {
    assignment_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DispatchAssignment",
      required: true,
    },

    driver_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Driver",
      required: true,
    },

    lat: {
      type: Number,
      required: true,
    },

    lng: {
      type: Number,
      required: true,
    },

    speed: {
      type: Number,
      default: 0,
    },

    recorded_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

driverLocationSchema.index({
  assignment_id: 1,
  driver_id: 1,
  recorded_at: -1,
});

export default mongoose.model("DriverLocation", driverLocationSchema);