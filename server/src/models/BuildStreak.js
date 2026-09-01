import mongoose from "mongoose";

const { Schema } = mongoose;

/** A single day's build log entry. */
const entrySchema = new Schema(
  {
    // Stored as a YYYY-MM-DD string for stable, timezone-free day keys
    // (the heatmap and streak maths operate on calendar days).
    date: { type: String, required: true },
    title: { type: String, required: true, maxlength: 140 },
    description: { type: String, default: "", maxlength: 1000 },
    tags: [{ type: String, trim: true }],
  },
  { _id: false, timestamps: { createdAt: true, updatedAt: false } }
);

/** One BuildStreak document per user holds their entire build history. */
const buildStreakSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    entries: [entrySchema],
    // Cached streak stats, recomputed whenever an entry is added.
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastEntryDate: { type: String, default: "" },
  },
  { timestamps: true }
);

/**
 * Recompute current & longest streak from the entry set. A streak counts
 * consecutive calendar days with at least one entry; the current streak
 * only "counts" if the most recent entry is today or yesterday.
 */
buildStreakSchema.methods.recomputeStreaks = function recomputeStreaks() {
  const days = [...new Set(this.entries.map((e) => e.date))].sort();
  if (days.length === 0) {
    this.currentStreak = 0;
    this.longestStreak = 0;
    this.lastEntryDate = "";
    return;
  }

  const DAY = 86400000;
  const toTime = (d) => new Date(`${d}T00:00:00Z`).getTime();

  let longest = 1;
  let run = 1;
  for (let i = 1; i < days.length; i += 1) {
    const gap = (toTime(days[i]) - toTime(days[i - 1])) / DAY;
    run = gap === 1 ? run + 1 : 1;
    if (run > longest) longest = run;
  }

  // Current streak: walk backwards from the latest entry.
  let current = 1;
  for (let i = days.length - 1; i > 0; i -= 1) {
    const gap = (toTime(days[i]) - toTime(days[i - 1])) / DAY;
    if (gap === 1) current += 1;
    else break;
  }

  const last = days[days.length - 1];
  const today = new Date();
  const todayKey = today.toISOString().slice(0, 10);
  const yesterdayKey = new Date(today.getTime() - DAY)
    .toISOString()
    .slice(0, 10);
  if (last !== todayKey && last !== yesterdayKey) current = 0;

  this.currentStreak = current;
  this.longestStreak = longest;
  this.lastEntryDate = last;
};

buildStreakSchema.set("toJSON", { virtuals: true, versionKey: false });

export const BuildStreak = mongoose.model("BuildStreak", buildStreakSchema);
