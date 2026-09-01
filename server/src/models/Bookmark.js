import mongoose from "mongoose";

const { Schema } = mongoose;

const bookmarkSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    post: { type: Schema.Types.ObjectId, ref: "Post", required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// One bookmark per (user, post) — enables idempotent save/unsave.
bookmarkSchema.index({ user: 1, post: 1 }, { unique: true });
bookmarkSchema.set("toJSON", { virtuals: true, versionKey: false });

export const Bookmark = mongoose.model("Bookmark", bookmarkSchema);
