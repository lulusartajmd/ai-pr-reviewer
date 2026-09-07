# AI PR Reviewer — Week 1 Scaffold

Goal for this week: get a real GitHub PR event triggering your server and
posting a comment back. Just proving the plumbing works.
Everything after this (embeddings, retrieval, LLM review) hooks into the
two webhook handlers already stubbed out in `server.js`.

## 1. Create a GitHub App

1. Go to https://github.com/settings/apps/new (use a personal test account,
   not a random repo you don't own).
2. **GitHub App name**: anything unique, e.g. `your-name-pr-reviewer`.
3. **Homepage URL**: can be your GitHub profile URL for now.
4. **Webhook URL**: leave this tab open — you'll fill it in after step 2 below.
5. **Webhook secret**: make up a random string and save it, you'll need it in `.env`.
6. **Permissions** (under "Repository permissions"):
   - Pull requests: Read and write
   - Contents: Read-only
   - Issues: Read and write (PR comments use the issues API under the hood)
7. **Subscribe to events**: check "Pull request".
8. Click **Create GitHub App**.
9. On the app's page, click **Generate a private key** — this downloads a `.pem` file. Keep it safe, you can't re-download it.
10. Note the **App ID** shown near the top of the page.

## 2. Expose your local server to GitHub (for development)

GitHub needs a public URL to send webhooks to. Locally, use a tunnel:

```bash
npx smee-client --url https://smee.io/new   # prints a unique proxy URL
```

Copy the printed `https://smee.io/xxxxx` URL. Go back to your GitHub App
settings and paste it as the **Webhook URL**, then save.

Keep the `smee-client` command running in one terminal — it forwards
GitHub's webhook deliveries to your local server once it's running.

Actually, for smee to forward to your local server, run it pointed at your
local port instead of just printing the URL:

```bash
npx smee-client --url https://smee.io/xxxxx --target http://localhost:3000/webhook
```

## 3. Install the app on a test repository

On your GitHub App's settings page, click **Install App**, and choose a
repo you don't mind opening throwaway test PRs against (a new empty repo
is fine).

## 4. Configure and run the server

```bash
cp .env.example .env
# Fill in GITHUB_APP_ID, GITHUB_PRIVATE_KEY (paste the .pem contents), GITHUB_WEBHOOK_SECRET

npm install
npm start
```

You should see:
```
Server listening on port 3000
Webhook endpoint: http://localhost:3000/webhook
```

## 5. Test it

Open a pull request on the test repo you installed the app on. Within a
few seconds you should see a log line in your terminal and a comment
appear on the PR saying "AI PR Reviewer is online."

If nothing happens: check the smee terminal for delivery errors, check
your GitHub App's "Advanced" tab for webhook delivery logs (GitHub shows
you the exact payload and response code for every delivery — this is
your best debugging tool), and double check the webhook secret matches
exactly in both places.

## What's next

- Week 2-3: replace the "online" comment with real diff fetching + an
  embedding pipeline over the repo.
- Week 4: LLM review logic grounded in retrieved context.
- Week 5: structured inline comments instead of one blob.
- Week 6: the eval harness.
