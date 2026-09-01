import mongoose from "mongoose";
import { COLLAB_ROLES } from "../config/constants.js";

const { Schema } = mongoose;

/** A role the team is actively recruiting for. */
const openRoleSchema = new Schema(
  {
    role: { type: String, enum: COLLAB_ROLES, default: "Other" },
    count: { type: Number, default: 1, min: 1 },
    filled: { type: Number, default: 0 },
  },
  { _id: false }
);

/** Someone who has requested to join the team. */
const applicantSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, default: "Other" },
    message: { type: String, maxlength: 500, default: "" },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const hackathonTeamSchema = new Schema(
  {
    hackathon: {
      type: Schema.Types.ObjectId,
      ref: "Hackathon",
      required: true,
      index: true,
    },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    projectIdea: { type: String, required: true, maxlength: 160 },
    description: { type: String, default: "", maxlength: 2000 },

    members: [{ type: Schema.Types.ObjectId, ref: "User" }],
    skills: [{ type: String, trim: true }],
    openRoles: [openRoleSchema],
    applicants: [applicantSchema],

    status: {
      type: String,
      enum: ["recruiting", "full", "closed"],
      default: "recruiting",
      index: true,
    },
  },
  { timestamps: true }
);

hackathonTeamSchema.index({ projectIdea: "text", skills: "text" });
hackathonTeamSchema.set("toJSON", { virtuals: true, versionKey: false });

export const HackathonTeam = mongoose.model(
  "HackathonTeam",
  hackathonTeamSchema
);
