import mongoose from "mongoose";
import { COLLAB_ROLES } from "../config/constants.js";

const { Schema } = mongoose;

const teamMemberSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, default: "Contributor" },
  },
  { _id: false }
);

const projectSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    slug: { type: String, index: true },
    tagline: { type: String, default: "", maxlength: 160 },
    description: { type: String, default: "", maxlength: 5000 },

    coverImage: { type: String, default: "" },
    screenshots: [{ type: String }],
    demoVideo: { type: String, default: "" },

    githubUrl: { type: String, default: "" },
    liveUrl: { type: String, default: "" },

    techStack: [{ type: String, trim: true }],
    category: { type: String, default: "Web", trim: true },

    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    team: [teamMemberSchema],

    // Collaboration toggle + the roles the owner is recruiting for.
    collaboration: {
      open: { type: Boolean, default: false },
      roles: [{ type: String, enum: COLLAB_ROLES }],
    },

    starredBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
    starsCount: { type: Number, default: 0 },
    viewsCount: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

projectSchema.index({ name: "text", tagline: "text", techStack: "text" });
projectSchema.index({ starsCount: -1 });
projectSchema.set("toJSON", { virtuals: true, versionKey: false });

export const Project = mongoose.model("Project", projectSchema);
