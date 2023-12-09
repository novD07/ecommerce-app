import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    products: [
      {
        type: mongoose.ObjectId,
        ref: "Products",
      },
    ],
    payment: {},
    buyer: {
      type: mongoose.ObjectId,
      ref: "users",
    },
    status: {
      type: String,
      default: "Chưa xử lí",
      enum: ["Chưa xử lí", "Chấp nhận", "Từ chối"],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
