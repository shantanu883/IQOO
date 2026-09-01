import mongoose from "mongoose";
import { COLLAB_ROLES } from "../config/constants.js";

const { Schema } = mongoose;

const collaborationRequestSchema = new Schema(
  {
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    requester: { type: Schema.Types.ObjectId, ref: "User", required: true },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: COLLAB_ROLES, default: "Other" },
    message: { type: String, maxlength: 1000, default: "" },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
      index: true,
    },
  },
  { timestamps: true }
);

// A requester can only have one open request per project.
collaborationRequestSchema.index(
  { project: 1, requester: 1 },
  { unique: true }
);
collaborationRequestSchema.set("toJSON", { virtuals: true, versionKey: false });

export const CollaborationRequest = mongoose.model(
  "CollaborationRequest",
  collaborationRequestSchema
);
