import mongoose from "mongoose";

const { Schema } = mongoose;

/**
 * A polymorphic "like" that can target a Post or a Comment. The unique
 * compound index guarantees a user can only like a given target once,
 * which lets us implement idempotent like/unlike toggles cheaply.
 */
const likeSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    target: { type: Schema.Types.ObjectId, required: true, refPath: "targetType" },
    targetType: { type: String, required: true, enum: ["Post", "Comment"] },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

likeSchema.index({ user: 1, target: 1 }, { unique: true });
likeSchema.index({ target: 1 });
likeSchema.set("toJSON", { virtuals: true, versionKey: false });

export const Like = mongoose.model("Like", likeSchema);
