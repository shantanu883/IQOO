import mongoose from "mongoose";
import { NOTIFICATION_TYPES } from "../config/constants.js";

const { Schema } = mongoose;

const notificationSchema = new Schema(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    actor: { type: Schema.Types.ObjectId, ref: "User" },
    type: { type: String, enum: NOTIFICATION_TYPES, required: true },

    // Optional links to the entity the notification is about.
    post: { type: Schema.Types.ObjectId, ref: "Post" },
    project: { type: Schema.Types.ObjectId, ref: "Project" },
    conversation: { type: Schema.Types.ObjectId, ref: "Conversation" },

    text: { type: String, default: "" },
    read: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });
notificationSchema.set("toJSON", { virtuals: true, versionKey: false });

export const Notification = mongoose.model("Notification", notificationSchema);
