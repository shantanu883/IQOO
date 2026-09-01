import mongoose from "mongoose";
import { CODE_LANGUAGES } from "../config/constants.js";

const { Schema } = mongoose;

const messageSchema = new Schema(
  {
    conversation: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },

    // Rich message kinds — a code snippet or a shared project/invite
    // renders differently in the UI than plain text.
    kind: {
      type: String,
      enum: ["text", "code", "project", "collab_invite", "team_invite"],
      default: "text",
    },
    text: { type: String, default: "", maxlength: 4000 },
    code: {
      language: { type: String, enum: CODE_LANGUAGES },
      content: { type: String, maxlength: 20000 },
    },
    project: { type: Schema.Types.ObjectId, ref: "Project" },

    readBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

messageSchema.index({ conversation: 1, createdAt: 1 });
messageSchema.set("toJSON", { virtuals: true, versionKey: false });

export const Message = mongoose.model("Message", messageSchema);
