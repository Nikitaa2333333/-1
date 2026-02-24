---
name: preventing-token-overflow
description: Detects when processing large volumes of data (JSON, logs, text) might exceed token/context limits and proactively suggests local script-based processing instead of direct chat output. Use when the user requests processing for large files or results containing hundreds of items.
---

# Preventing Token Overflow

## When to use this skill
- When requested to process or display large JSON files (e.g., > 20KB or > 50 items).
- When a task involves transforming long lists of data that would bloat the conversation history.
- When the user asks for operations on "all" items in a large dataset.

## Workflow
1.  **Estimate Volume**: Before outputting data, check the size/count. If it's likely to exceed 100 lines or 50KB of raw text, trigger this skill.
2.  **Alert User**: Inform the user about the potential token limit risk ("bratan, this much data will blow our limits").
3.  **Propose Local Script**: Instead of doing the work in chat, write a `.mjs` or `.ps1` script for the user to run locally.
4.  **Execute via Script**: Provide the script, explain what it does, and wait for the user to run it.

## Instructions
- **Data Thresholds**: 
    - Max 50 items in a JSON array for direct display.
    - Max 5000 characters of raw data per message.
- **Solution Patterns**:
    - For JSON transformation: Provide a `node -e "..."` snippet or a standalone `.mjs` script.
    - For file searching: Use `grep` or `find` and only output summaries.
    - For integration: Create a dedicated data file (e.g., `data_new.ts`) and import it, rather than rewriting the entire main file.
- **Communication Style**: Be proactive and "brotherly". Explain that local processing is faster and keeps the AI's "brain" (context) sharp.
