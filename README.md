# AI PR Review Assistant
An AI-powered GitHub App that reviews Pull Requests and provides useful code review feedback.

## Project Goal
I'm building a GitHub App that can automatically review Pull Requests by analyzing the changed code and relevant parts of the repository.

The goal is for the reviewer to:
- Detect when a Pull Request is opened or updated
- Analyze the code changes
- Find relevant code from the repository for additional context
- Use an LLM to identify potential bugs and improvements
- Post review feedback directly on the Pull Request
- Measure how accurate and useful the reviews are

## How It Works
GitHub Pull Request
        ↓
     Webhook
        ↓
   Node.js Server
        ↓
 Repository Context
        ↓
    LLM Review
        ↓
 GitHub Comments


During local development, Smee forwards GitHub webhook events to my local Node.js server.

## Tech Stack
- JavaScript
- Node.js
- Express
- GitHub Apps
- GitHub Webhooks
- Octokit
- Smee
- LLM API
- Embeddings / Vector Search
- Git

## Current Progress

### Week 1 — GitHub App & Webhooks
- [x] Created Node.js project
- [x] Created GitHub repository
- [x] Created and configured a GitHub App
- [x] Configured Pull Request permissions
- [x] Installed the GitHub App on the test repository
- [x] Connected GitHub webhooks to a local Node.js server
- [x] Set up Smee for local webhook forwarding
- [x] Received a real Pull Request webhook event
- [x] Successfully posted a test comment to the Pull Request

### Next Steps
- [ ] Handle Pull Request events
- [ ] Fetch Pull Request changes
- [ ] Build repository context
- [ ] Add embeddings and vector search
- [ ] Integrate the LLM review engine
- [ ] Post review comments
- [ ] Build an evaluation system
- [ ] Measure review accuracy and performance
- [ ] Deploy the application

## Local Development

### Requirements
- Node.js
- Git
- GitHub account

### Installation
```bash
npm install
```

### Environment Variables
Create a `.env` file based on `.env.example`.

The `.env` file contains private credentials and should never be committed to Git.

Required variables:
GITHUB_APP_ID=
GITHUB_PRIVATE_KEY=
GITHUB_WEBHOOK_SECRET=
PORT=3000


### Run the Server
```bash
npm start
```

The server runs locally at:
```text
http://localhost:3000
```

For local webhook development, Smee is used to forward GitHub events to the local webhook endpoint.

## Project Status
This project is currently under active development.
