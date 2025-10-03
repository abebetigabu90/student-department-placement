import mongoose from "mongoose";

const PlacementSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    priority: {
      type: Number,
      required: true,
      min: 1, // priority should start from 1
    },
  },
  { timestamps: true }
);

// Optional: prevent duplicate priorities per student
const Placement = mongoose.model("Placement", PlacementSchema);
export default Placement;
