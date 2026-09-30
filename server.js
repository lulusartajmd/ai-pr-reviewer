import "dotenv/config.js";
import { formatUsername } from "./utils.js";

import express from "express";
import { App } from "@octokit/app";
import { createNodeMiddleware } from "@octokit/webhooks";

// --- Sanity check env vars before doing anything else ---
const required = ["GITHUB_APP_ID", "GITHUB_PRIVATE_KEY", "GITHUB_WEBHOOK_SECRET"];
for (const key of required) {
  if (!process.env[key]) {
    console.error(`Missing required env var: ${key}. Copy .env.example to .env and fill it in.`);
    process.exit(1);
  }
}

const app = new App({
  appId: process.env.GITHUB_APP_ID,
  privateKey: process.env.GITHUB_PRIVATE_KEY.replace(/\\n/g, "\n"),
  webhooks: { secret: process.env.GITHUB_WEBHOOK_SECRET },
});

// --- Week 1 goal: prove the plumbing works end to end ---
// When a PR opens, comment once so you know GitHub -> your server -> GitHub round-trips.
app.webhooks.on("pull_request.opened", async ({ octokit, payload }) => {
  const username = formatUsername(" TestUser ");
  console.log("Formatted username:", username);
  
  const { number } = payload.pull_request;
  const { owner, name: repo } = payload.repository;
  console.log(`PR #${number} opened in ${owner.login}/${repo}`);

  const { data: files } = await octokit.request(
    "GET /repos/{owner}/{repo}/pulls/{pull_number}/files",
    {
        owner: owner.login,
        repo,
        pull_number: number,
    } 
  );

  console.log("Changed files:");
  console.log(files.map((file) => file.filename));

  const { data: repoTree } = await octokit.request(
    "GET /repos/{owner}/{repo}/git/trees/{tree_sha}",
    {
      owner: owner.login,
      repo,
      tree_sha: payload.pull_request.head.sha,
      recursive: "true",
    }
  );

  console.log("Repository files:");
  console.log(
    repoTree.tree
      .filter((item) => item.type === "blob")
      .map((item) => item.path)
  );

  const repositoryContext = [];

  for (const file of files) {
    const fileContent = await octokit.request(
      "GET /repos/{owner}/{repo}/contents/{path}",
      {
        owner: owner.login,
        repo,
        path: file.filename,
        ref: payload.pull_request.head.sha,
      }
    );

    const code = Buffer.from(
      fileContent.data.content,
      "base64"
    ).toString("utf8");

    repositoryContext.push({
      filename: file.filename,
      content: code,
    });

    console.log(`Repository context — ${file.filename}:`);
    console.log(code);
  }

  console.log("Stored repository context:");
  console.log(repositoryContext.map((file) => file.filename));
  
  const changes = files.map((file) => ({
    filename: file.filename,
    status: file.status,
    patch: file.patch,
  }));

  const reviewInput = changes
    .filter((change) => change.patch)
    .map(
      (change) =>
        `File: ${change.filename}\nStatus: ${change.status}\n\nChanges:\n${change.patch}`
    )
    .join("\n\n");

  console.log("Review input:");
  console.log(reviewInput);

  await octokit.request("POST /repos/{owner}/{repo}/issues/{issue_number}/comments", {
    owner: owner.login,
    repo,
    issue_number: number,
    body: "AI PR Reviewer is online. Full review logic coming in week 4.",
  });
});

// Just log for now — this is where re-review logic will hook in later (week 4-5).
app.webhooks.on("pull_request.synchronize", async ({ payload }) => {
  console.log(`PR #${payload.pull_request.number} updated with new commits`);
});

app.webhooks.onError((error) => {
  console.error(`Webhook error: ${error.message}`);
});

const expressApp = express();
expressApp.get("/", (_req, res) => res.send("AI PR Reviewer is running."));
expressApp.use(createNodeMiddleware(app.webhooks, { path: "/webhook" }));

const PORT = process.env.PORT || 3000;
expressApp.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  console.log(`Webhook endpoint: http://localhost:${PORT}/webhook`);
});
