import mongoose from "mongoose";

const { Schema } = mongoose;

const commentSchema = new Schema(
  {
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
      index: true,
    },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true, trim: true, maxlength: 1000 },
    // Threaded replies: null for top-level comments.
    parent: { type: Schema.Types.ObjectId, ref: "Comment", default: null },
    likesCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

commentSchema.index({ post: 1, createdAt: -1 });
commentSchema.set("toJSON", { virtuals: true, versionKey: false });

export const Comment = mongoose.model("Comment", commentSchema);
