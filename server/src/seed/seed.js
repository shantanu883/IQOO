/* eslint-disable no-console */
import mongoose from "mongoose";
import { env, features } from "../config/env.js";
import {
  User,
  Post,
  Project,
  Hackathon,
  BuildStreak,
  Notification,
  Comment,
  Like,
  Bookmark,
  CollaborationRequest,
  HackathonTeam,
  Conversation,
  Message,
  Achievement,
} from "../models/index.js";
import {
  developers,
  buildPosts,
  buildProjects,
  hackathons,
  buildStreakEntries,
} from "./data.js";

async function run() {
  if (!features.db) {
    console.error(
      "\n  ✗ MONGODB_URI is not set. Add it to server/.env before seeding.\n"
    );
    process.exit(1);
  }

  await mongoose.connect(env.mongoUri);
  console.log("  Connected. Clearing existing data…");

  await Promise.all([
    User.deleteMany({}),
    Post.deleteMany({}),
    Project.deleteMany({}),
    Hackathon.deleteMany({}),
    BuildStreak.deleteMany({}),
    Notification.deleteMany({}),
    Comment.deleteMany({}),
    Like.deleteMany({}),
    Bookmark.deleteMany({}),
    CollaborationRequest.deleteMany({}),
    HackathonTeam.deleteMany({}),
    Conversation.deleteMany({}),
    Message.deleteMany({}),
    Achievement.deleteMany({}),
  ]);

  // Users — created individually so the password-hashing hook runs.
  console.log("  Seeding developers…");
  const createdUsers = [];
  for (const dev of developers) {
    // eslint-disable-next-line no-await-in-loop
    createdUsers.push(await User.create(dev));
  }
  const byUser = Object.fromEntries(
    createdUsers.map((u) => [u.username, u._id])
  );

  // A small follow graph so profiles aren't empty.
  const [shantanu, arjun, priya] = createdUsers;
  shantanu.following = [arjun._id, priya._id];
  shantanu.followingCount = 2;
  arjun.followers = [shantanu._id];
  arjun.followersCount = 1;
  priya.followers = [shantanu._id];
  priya.followersCount = 1;
  await Promise.all([shantanu.save(), arjun.save(), priya.save()]);

  console.log("  Seeding posts…");
  const posts = await Post.insertMany(buildPosts(byUser));
  await User.updateOne({ _id: shantanu._id }, { postsCount: 2 });

  console.log("  Seeding projects…");
  const projects = await Project.insertMany(buildProjects(byUser));

  console.log("  Seeding hackathons…");
  await Hackathon.insertMany(hackathons);

  console.log("  Seeding build streak…");
  const streak = new BuildStreak({
    user: shantanu._id,
    entries: buildStreakEntries(),
  });
  streak.recomputeStreaks();
  await streak.save();

  console.log("  Seeding achievements & notifications…");
  await Achievement.insertMany([
    { user: shantanu._id, key: "first_project", title: "First Project", icon: "🚀" },
    { user: shantanu._id, key: "streak_7", title: "7 Day Build Streak", icon: "🔥" },
    { user: arjun._id, key: "hackathon", title: "Hackathon Participant", icon: "🏆" },
  ]);

  await Notification.insertMany([
    {
      recipient: shantanu._id,
      actor: arjun._id,
      type: "like",
      post: posts[0]._id,
      text: "arjun_ml liked your post",
    },
    {
      recipient: shantanu._id,
      actor: priya._id,
      type: "follow",
      text: "priya_codes started following you",
      read: false,
    },
    {
      recipient: shantanu._id,
      actor: arjun._id,
      type: "star",
      project: projects[0]._id,
      text: "arjun_ml starred DevBoard",
      read: true,
    },
  ]);

  console.log(
    `\n  ✓ Seed complete — ${createdUsers.length} developers, ${posts.length} posts, ${projects.length} projects, ${hackathons.length} hackathons.`
  );
  console.log("  Demo login →  shantanu@devloop.dev  /  password123\n");
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
