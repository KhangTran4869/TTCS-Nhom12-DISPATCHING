import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema(
  {
    plate_number: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    vehicle_type: {
      type: String,
      enum: ["motorbike", "van", "truck", "container"],
      default: "truck",
    },

    capacity: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["available", "in_use", "maintenance"],
      default: "available",
    },

    current_location: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Vehicle", vehicleSchema);
