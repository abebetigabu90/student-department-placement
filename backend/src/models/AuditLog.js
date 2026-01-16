// import mongoose from "mongoose";

// const auditLogSchema = new mongoose.Schema(
//   {
//     actorId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Registrar", // Registrar/Admin
//       required: true
//     },
//     actorRole: {
//       type: String,
//       enum: ["registrar", "admin"],
//       required: true
//     },
//     action: {
//       type: String,
//       required: true
//       // e.g. "SOFT_DELETE_STUDENT"
//     },
//     targetModel: {
//       type: String,
//       required: true
//       // e.g. "Student"
//     },
//     targetId: {
//       type: mongoose.Schema.Types.ObjectId,
//       required: true
//     },
//     // reason: {
//     //   type: String
//     // },
//     timestamp: {
//       type: Date,
//       default: Date.now
//     }
//   },
//   { timestamps: true }
// );

// export default mongoose.model("AuditLog", auditLogSchema);


import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
      actorId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "actorModel"
    },
    actorModel: {
      type: String,
      required: true,
      enum: ["Registrar", "Admin"]
    },
    actorRole: {
      type: String,
      enum: ["admin", "registrar"],
      required: true
    },
    action: {
      type: String,
      required: true
    },
    targetModel: {
      type: String,
      required: true
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true
    },
    changes: {
        changedFields: [{
          type: String
        }],
        oldValues: {  // NEW
          type: mongoose.Schema.Types.Mixed, // Can store any JSON
          default: {}
        },
        newValues: {  // NEW
          type: mongoose.Schema.Types.Mixed,
          default: {}
        }
  },
  },
  { timestamps: true }
);

export default mongoose.model("AuditLog", auditLogSchema);

