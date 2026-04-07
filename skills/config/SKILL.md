---
name: config
description: View or change in-the-loop quiz settings (frequency and difficulty)
argument-hint: [--frequency every|often|sometimes|rarely] [--difficulty beginner|intermediate|advanced]
allowed-tools: [Read, Write]
---

# Configure In-The-Loop

Read and optionally modify the in-the-loop configuration at `~/.in-the-loop/config.json`.

## Config Schema

```json
{
  "frequency": "sometimes",
  "difficulty": "intermediate"
}
```

**frequency** — how often questions appear:
- `every`: every stop / every 5th tool use
- `often`: every 2nd stop / every 8th tool use
- `sometimes` (default): every 3rd stop / every 12th tool use
- `rarely`: every 5th stop / every 20th tool use

**difficulty** — question complexity:
- `beginner`: fundamental concepts
- `intermediate` (default): design decisions, trade-offs, best practices
- `advanced`: edge cases, security, performance, architecture

## Instructions

1. Read `~/.in-the-loop/config.json`. If it doesn't exist, treat the defaults above as the current config.
2. If the user provided arguments (`$ARGUMENTS`), parse them:
   - `--frequency <value>` — must be one of: `every`, `often`, `sometimes`, `rarely`
   - `--difficulty <value>` — must be one of: `beginner`, `intermediate`, `advanced`
   - Report an error if an unrecognized value is given.
3. If changes were requested, create `~/.in-the-loop/` if needed, then write the updated config as formatted JSON.
4. Display the current (or updated) configuration to the user.
