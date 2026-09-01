import mongoose from "mongoose";

const { Schema } = mongoose;

const conversationSchema = new Schema(
  {
    participants: [
      { type: Schema.Types.ObjectId, ref: "User", required: true },
    ],
    isGroup: { type: Boolean, default: false },
    title: { type: String, default: "" },

    // Denormalised preview for fast conversation-list rendering.
    lastMessage: {
      text: { type: String, default: "" },
      sender: { type: Schema.Types.ObjectId, ref: "User" },
      at: { type: Date },
    },
  },
  { timestamps: true }
);

conversationSchema.index({ participants: 1, updatedAt: -1 });
conversationSchema.set("toJSON", { virtuals: true, versionKey: false });

export const Conversation = mongoose.model("Conversation", conversationSchema);
