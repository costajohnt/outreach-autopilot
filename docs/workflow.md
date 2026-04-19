# Workflow

## Weekly rhythm

**Monday (5 min):**
- Run `/outreach-review` to see what needs attention this week
- Pick 3-5 targets to engage with

**Tuesday through Friday (5 min/day):**
- Check each target's LinkedIn profile for recent posts
- For each post that's worth engaging with, run `/outreach-draft-comment` and post one comment
- After posting, run `/outreach-log` to record the engagement

**Friday (5 min):**
- Run `/outreach-review`
- For targets in "ready to connect" bucket, send connection requests with a short note referencing the prior comment
- Run `/outreach-log` with action like "Connection sent, note referencing X" after each

**Monthly:**
- Review `/outreach-review` output for patterns — what's converting, what's not
- Add 5-10 new targets to the list
- Prune targets that have gone cold (mark status `cold` in their file)

## Adding a new target

1. Run `/outreach-target-add`
2. Answer the prompts (name, company, role, LinkedIn URL)
3. Open the target file Claude created
4. Under `## Research notes`, add:
   - What they post about (their themes)
   - Recent notable posts
   - Hooks for your first comment
   - Any mutual connections

## Finding posts to engage with

- Check target's LinkedIn profile → Activity tab → Posts
- Look for posts in the past 7-14 days
- Prefer posts with <50 comments (you're more likely to be seen)
- Prefer posts where you have a genuine take, not empty agreement
