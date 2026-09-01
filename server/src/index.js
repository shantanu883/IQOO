import { createApp } from "./app.js";
import { connectDB } from "./config/db.js";
import { env, features } from "./config/env.js";

async function start() {
  await connectDB();

  const app = createApp();
  app.listen(env.port, () => {
    console.log(`\n  DevLoop API → http://localhost:${env.port}`);
    console.log(`  Environment: ${env.nodeEnv}`);
    console.log(`  Database:    ${features.db ? "configured" : "no-DB mode"}`);
    console.log(
      `  Integrations: ${[
        features.githubOAuth && "GitHub",
        features.googleOAuth && "Google",
        features.gemini && "Gemini",
        features.judge0 && "Judge0",
      ]
        .filter(Boolean)
        .join(", ") || "none configured (mock fallbacks active)"}\n`
    );
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
