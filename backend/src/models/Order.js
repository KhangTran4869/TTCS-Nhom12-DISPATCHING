import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    order_code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    sender_name: {
      type: String,
      required: true,
      trim: true,
    },

    sender_phone: {
      type: String,
      required: true,
      trim: true,
    },

    pickup_address: {
      type: String,
      required: true,
    },

    pickup_location: {
      lat: Number,
      lng: Number,
    },

    receiver_name: {
      type: String,
      required: true,
      trim: true,
    },

    receiver_phone: {
      type: String,
      required: true,
      trim: true,
    },

    delivery_address: {
      type: String,
      required: true,
    },

    delivery_location: {
      lat: Number,
      lng: Number,
    },

    cargo_description: {
      type: String,
    },

    cargo_weight: {
      type: Number,
      default: 0,
    },

    requested_pickup_time: {
      type: Date,
    },

    requested_delivery_time: {
      type: Date,
    },

    priority: {
      type: String,
      enum: ["normal", "high", "urgent"],
      default: "normal",
    },

    status: {
      type: String,
      enum: [
        "pending",
        "assigned",
        "picked_up",
        "in_transit",
        "arrived",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Order", orderSchema);
