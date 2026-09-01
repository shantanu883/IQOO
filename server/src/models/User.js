import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import {
  TECHNOLOGIES,
  EXPERIENCE_LEVELS,
  INTERESTS,
} from "../config/constants.js";

const { Schema } = mongoose;

const socialSchema = new Schema(
  {
    username: { type: String, trim: true, default: "" },
    connected: { type: Boolean, default: false },
    // GitHub-only cached stats (refreshed from the GitHub API on demand).
    publicRepos: { type: Number, default: 0 },
    followers: { type: Number, default: 0 },
    following: { type: Number, default: 0 },
    stars: { type: Number, default: 0 },
    topLanguages: [{ type: String }],
    syncedAt: { type: Date },
  },
  { _id: false }
);

const userSchema = new Schema(
  {
    fullName: { type: String, required: true, trim: true, maxlength: 80 },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
      match: [/^[a-z0-9_]+$/, "Username may only contain a-z, 0-9 and _"],
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    // Never selected by default — must be explicitly requested.
    passwordHash: { type: String, select: false },

    avatar: { type: String, default: "" },
    coverImage: { type: String, default: "" },
    bio: { type: String, default: "", maxlength: 280 },
    location: { type: String, default: "", maxlength: 80 },
    college: { type: String, default: "", maxlength: 120 },
    company: { type: String, default: "", maxlength: 120 },
    website: { type: String, default: "" },
    linkedin: { type: String, default: "" },

    github: { type: socialSchema, default: () => ({}) },

    // Onboarding data — drives personalised recommendations & matching.
    skills: [{ type: String, trim: true }],
    technologies: [{ type: String, enum: TECHNOLOGIES }],
    experienceLevel: { type: String, enum: EXPERIENCE_LEVELS },
    interests: [{ type: String, enum: INTERESTS }],
    onboarded: { type: Boolean, default: false },
    hackathonAvailable: { type: Boolean, default: false },

    isVerified: { type: Boolean, default: false },
    roles: [{ type: String, enum: ["user", "admin"], default: "user" }],

    // Social graph. Denormalised counts are kept in sync on follow/unfollow
    // so profile cards render without an extra aggregation.
    followers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: Schema.Types.ObjectId, ref: "User" }],
    followersCount: { type: Number, default: 0 },
    followingCount: { type: Number, default: 0 },
    postsCount: { type: Number, default: 0 },
    projectsCount: { type: Number, default: 0 },
    starsCount: { type: Number, default: 0 },

    // OAuth identity links.
    oauth: {
      googleId: { type: String, index: true, sparse: true },
      githubId: { type: String, index: true, sparse: true },
    },

    // Hashed refresh tokens for rotation/revocation.
    refreshTokens: { type: [String], select: false, default: [] },

    lastActiveAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Text index powering developer search.
userSchema.index({
  fullName: "text",
  username: "text",
  bio: "text",
  skills: "text",
});

/** Hash the password whenever it is set/changed. */
userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("passwordHash") || !this.passwordHash) return next();
  // Guard against double-hashing an already-hashed value.
  if (this.passwordHash.startsWith("$2")) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  if (!this.passwordHash) return Promise.resolve(false);
  return bcrypt.compare(candidate, this.passwordHash);
};

// Strip sensitive fields from any JSON serialisation.
userSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform(_doc, ret) {
    delete ret.passwordHash;
    delete ret.refreshTokens;
    return ret;
  },
});

export const User = mongoose.model("User", userSchema);
