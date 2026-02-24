---
name: aligning-tasks
description: Ensures the agent always confirms task understanding with the user before executing any code changes. Use this skill at the beginning of every task or when a new requirement is introduced.
---

# Task Alignment Protocol

## When to use this skill
- At the start of every new task.
- When the user provides a new request or modification.
- Before calling `write_to_file`, `replace_file_content`, or `run_command`.

## Workflow
1.  **Analyze**: Carefully read the user's request.
2.  **Summarize**: Provide a concise 3-5 point summary of the task in your own words.
3.  **Validate**: Explicitly ask the user for confirmation (e.g., "Is this correct?").
4.  **Wait**: DO NOT execute any code changes until the user says "Yes", "Confirm", "Да", or equivalent.
5.  **Execute**: Only then proceed with the implementation.

## Instructions
- Your summary must be in the language the user is currently using (e.g., Russian).
- If the request is ambiguous, ask for clarification instead of guessing.
- Highlight any potential side effects or architectural decisions in your summary.

## Check-point Checklist
- [ ] Have I described my understanding of the task?
- [ ] Have I listed the specific files I plan to modify?
- [ ] Have I waited for the user's explicit confirmation?
- [ ] (After confirmation) Am I following the established design system?

---

## Instructions for use
This skill is mandatory. Failure to follow the "Understand -> Confirm -> Execute" loop is a violation of the project's safety standards.
