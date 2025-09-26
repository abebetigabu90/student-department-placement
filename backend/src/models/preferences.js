import mongoose from "mongoose";

const preferenceSchema = new mongoose.Schema(
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
preferenceSchema.index({ student: 1, priority: 1 }, { unique: true });

const Preference = mongoose.model("Preference", preferenceSchema);
export default Preference;
