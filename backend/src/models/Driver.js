import mongoose from "mongoose";

const driverSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    license_number: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    license_type: {
      type: String,
      enum: ["A1", "A2", "B1", "B2", "C", "D", "E"],
      required: true,
    },

    experience_years: {
      type: Number,
      default: 0,
    },

    current_status: {
      type: String,
      enum: ["available", "assigned", "on_trip", "off"],
      default: "available",
    },

    rating: {
      type: Number,
      default: 5,
      min: 0,
      max: 5,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Driver", driverSchema);
