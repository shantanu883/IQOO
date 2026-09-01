import mongoose from "mongoose";
import { POST_TYPES, CODE_LANGUAGES } from "../config/constants.js";

const { Schema } = mongoose;

/** Embedded code payload for `code` posts (and code-bearing tutorials). */
const codeSchema = new Schema(
  {
    title: { type: String, trim: true, maxlength: 120, default: "" },
    description: { type: String, maxlength: 1000, default: "" },
    language: { type: String, enum: CODE_LANGUAGES, default: "javascript" },
    code: { type: String, required: true, maxlength: 20000 },
  },
  { _id: false }
);

const postSchema = new Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: { type: String, enum: POST_TYPES, default: "post", index: true },

    caption: { type: String, default: "", maxlength: 2000 },
    tags: [{ type: String, trim: true }],

    // Only present on `code` posts (or tutorials that ship a snippet).
    code: { type: codeSchema, default: undefined },

    // `project` posts reference a full Project document.
    project: { type: Schema.Types.ObjectId, ref: "Project" },

    // `achievement` posts render a badge.
    achievement: {
      title: { type: String },
      icon: { type: String },
    },

    media: {
      images: [{ type: String }],
      video: { type: String },
    },

    // Denormalised engagement counters (source of truth for display).
    likesCount: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
    bookmarksCount: { type: Number, default: 0 },
    sharesCount: { type: Number, default: 0 },
    viewsCount: { type: Number, default: 0 },

    isPinned: { type: Boolean, default: false },
  },
  { timestamps: true }
);

postSchema.index({ createdAt: -1 });
postSchema.index({ tags: 1 });
postSchema.index({ caption: "text", tags: "text" });

postSchema.set("toJSON", { virtuals: true, versionKey: false });

export const Post = mongoose.model("Post", postSchema);
