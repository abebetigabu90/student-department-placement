import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Registrar", // Registrar/Admin
      required: true
    },
    actorRole: {
      type: String,
      enum: ["registrar", "admin"],
      required: true
    },
    action: {
      type: String,
      required: true
      // e.g. "SOFT_DELETE_STUDENT"
    },
    targetModel: {
      type: String,
      required: true
      // e.g. "Student"
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    // reason: {
    //   type: String
    // },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

export default mongoose.model("AuditLog", auditLogSchema);
