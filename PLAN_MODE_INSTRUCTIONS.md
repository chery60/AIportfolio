# Plan Mode Instructions (Reconstructed)

> **Note:** Cursor's internal Plan Mode instructions are proprietary and not publicly documented. This document reconstructs effective plan-generation guidance based on:
> - Observed plan file structure in `.cursor/plans/`
> - [Cursor Plan Mode docs](https://cursor.com/docs/agent/planning)
> - Best practices from plan outputs

---

## When Plan Mode Is Used

Plan Mode should be triggered when the user describes:

- **Architectural decisions** where the approach should be reviewed first
- **Unclear requirements** that need exploration before scope is known
- **Tasks touching many files or systems**
- **Complex features** with multiple valid approaches

*For quick changes or familiar tasks, standard Agent mode is used instead.*

---

## Plan Generation Workflow

1. **Research** — Explore the codebase to find relevant files, components, and documentation
2. **Clarify** — Ask clarifying questions when requirements are ambiguous
3. **Analyze** — Identify root causes, constraints, and dependencies
4. **Plan** — Produce a detailed Markdown plan with concrete file paths and code references
5. **Present** — Output a reviewable plan the user can edit before building

---

## Required Plan Format

### YAML Frontmatter

```yaml
---
name: <Short descriptive plan name>
overview: <1-2 sentence summary of the plan>
todos:
  - id: <kebab-case-id>
    content: <Specific actionable task description>
    status: pending  # pending | in_progress | completed
  # ... more todos
isProject: false  # or true for larger multi-phase projects
---
```

### Markdown Body Structure

1. **Title** — `# <Plan Name>`
2. **Problem Analysis** — What is broken or missing? Who is affected?
3. **Root Cause** — Technical explanation; optionally with code snippets and file references
4. **Solution** — High-level approach; design decisions
5. **Implementation Details** — Per-task breakdown with:
   - File paths and line references
   - Before/after code patterns
   - Step-by-step changes
6. **Diagrams** (optional) — Mermaid sequence/flow diagrams for complex flows
7. **Testing/Verification** — Checklist or test scenarios

---

## Content Guidelines

### Problem Analysis

- State the problem clearly and concretely
- Include user/developer impact
- Use code citations with file paths and line ranges: `[path](path) lines X–Y`
- For multi-part problems, use numbered subsections

### Root Cause

- Explain *why* the problem exists, not just what is broken
- Reference specific code patterns that cause the issue
- Use sequence or flow diagrams when clarifying interactions

### Solution

- Describe the approach at a high level before implementation details
- List files to create, modify, or delete
- Note any patterns or libraries to adopt

### Implementation Details

- Each task should be **independently completable** and **testable**
- Include exact code snippets for key changes
- Use "Before" and "After" patterns for refactors
- Order tasks by dependency (no task should block another that precedes it)

### Todos

- Each todo maps to a concrete, scoped task
- Use imperative verbs: "Update", "Add", "Remove", "Refactor"
- Include file paths or component names in the content
- Keep todos focused; split large tasks into smaller ones

---

## References and Citations

- Use `[display text](relative/path/to/file)` for file links
- Include line ranges when citing code: `lines 50–58`
- Reference existing classes, functions, and components by name

---

## Plan Quality Checklist

- [ ] YAML frontmatter is valid and complete
- [ ] Problem is clearly stated with evidence from the codebase
- [ ] Root cause is identified, not just symptoms
- [ ] Solution is described before implementation details
- [ ] Todos are atomic, ordered, and actionable
- [ ] File paths and code references are accurate
- [ ] Diagrams (if any) accurately reflect current/future behavior
- [ ] Testing or verification steps are included

---

## Related

- [Cursor Plan Mode Docs](https://cursor.com/docs/agent/planning)
- [Cursor Help: Plan Mode](https://cursor.com/help/ai-features/plan-mode)
