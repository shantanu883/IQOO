import mongoose from "mongoose";

const { Schema } = mongoose;

/**
 * Earned achievement badges. `key` identifies the badge type so the UI
 * can map it to an icon/label, and the unique (user, key) index prevents
 * awarding the same badge twice.
 */
const achievementSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    key: { type: String, required: true },
    title: { type: String, required: true },
    icon: { type: String, default: "🏆" },
    description: { type: String, default: "" },
    earnedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

achievementSchema.index({ user: 1, key: 1 }, { unique: true });
achievementSchema.set("toJSON", { virtuals: true, versionKey: false });

export const Achievement = mongoose.model("Achievement", achievementSchema);
