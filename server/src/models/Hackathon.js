import mongoose from "mongoose";

const { Schema } = mongoose;

const hackathonSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 140 },
    slug: { type: String, index: true },
    organizer: { type: String, required: true, trim: true },
    description: { type: String, default: "", maxlength: 5000 },
    coverImage: { type: String, default: "" },

    startDate: { type: Date },
    endDate: { type: Date },
    registrationDeadline: { type: Date },

    mode: { type: String, enum: ["Online", "In-person", "Hybrid"], default: "Online" },
    location: { type: String, default: "Online" },

    prize: { type: String, default: "" },
    technologies: [{ type: String, trim: true }],
    teamSize: {
      min: { type: Number, default: 1 },
      max: { type: Number, default: 4 },
    },

    website: { type: String, default: "" },
    participantsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

hackathonSchema.index({ name: "text", technologies: "text" });
hackathonSchema.index({ registrationDeadline: 1 });
hackathonSchema.set("toJSON", { virtuals: true, versionKey: false });

export const Hackathon = mongoose.model("Hackathon", hackathonSchema);
