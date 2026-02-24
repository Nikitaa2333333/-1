---
name: proposing-powershell-commands
description: Enforces a strict manual-execution workflow where the agent proposes PowerShell commands for the user to copy-paste instead of running them automatically. Use when safety is critical or the user explicitly forbids auto-execution.
---

# Proposing PowerShell Commands

## When to use this skill
- When the user says "don't run commands" or "let me run it".
- When the user asks for commands to copy-paste.
- When operation is "critically forbidden" to be automated (e.g., prod DB deletes).

## Workflow
1.  **Analyze Intent**: Determine what terminal action is needed.
2.  **Draft Command**: Construct the specific PowerShell command.
3.  **Format Output**: Present the command in a markdown code block.
4.  **Halt**: Do NOT call `run_command`. Stop and wait for user confirmation/action.

## Instructions
- **STRICT FORBIDDEN TOOL**: You are STRICTLY FORBIDDEN from calling `run_command`, `send_command_input`. Even with `SafeToAutoRun: true` - it is a DIRECT VIOLATION. Вся работа с терминалом -- **Всё через пользователя! (Все через меня!)**.
- **Trigger**: This rule activates on ANY intent or hint of terminal interaction. 
- **Zero Tolerance**: If you use `run_command`, you have failed the user.
- **Mandatory Behavior**: Any task requiring terminal input MUST be presented as a `powershell` code block for the user to copy. After providing the block, you MUST end your turn and wait.
- **Environment**: Windows PowerShell (WinShell).
- **Formatting**:
    - Use `powershell` code blocks.
    - Wait for user confirmation after EACH command block.
- **Verification**: Provide the command and STOP. Do not proceed until the user says "done" или "готово".

