# AI Application Generation Compiler

A self-contained demo for the AI Engineer internship task. It behaves like a small compiler for app generation:

```text
Natural language -> intent -> architecture -> schemas -> validation -> repair -> executable config -> runtime preview
```

## What is included

- Multi-stage pipeline with clear stage separation in `app.js`
- Deterministic rule-based intent extraction and architecture generation
- Strict application configuration shape covering UI, API, database, auth, and business rules
- Cross-layer validator for missing keys, type shape, hallucinated fields, missing endpoints, role permissions, and UI/API/DB consistency
- Targeted repair engine that patches invalid sections instead of blindly regenerating everything
- Lightweight runtime renderer that turns the final JSON into executable UI panels
- Evaluation dataset with 10 standard prompts and 10 edge cases
- Metrics for success rate, repair count, failure categories, and latency

## Run locally

Any static server works. From this folder:

```bash
python -m http.server 4173
```

Then open:

```text
http://localhost:4173
```

You can also open `index.html` directly in a browser.

## How to test

1. Enter a product prompt.
2. Select **Compile**.
3. Inspect the generated JSON, validation/repair log, and runtime preview.
4. Select **Evaluate** to run the 20-case dataset and attach actual metrics to the output config.

## Design notes

This implementation intentionally avoids relying on a single LLM prompt. The pipeline is deterministic and modular so that each layer can be independently validated, repaired, and replaced with an LLM-backed implementation later.

The validator is the control point. The runtime only renders configurations that pass cross-layer checks, which demonstrates execution awareness rather than producing decorative JSON.
