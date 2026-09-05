# AI prompts

## Understanding and planning the assignment

### Prompt

“We are pleased to share your Take-Home Project Assignment… Please go through README.md carefully before starting.” Followed by: “then lets make this project”.

### What I got

The assistant read the full brief and all five documentation templates, identified the empty starter state, initialized the repository, and proposed a staged full-stack implementation covering the ten goals.

### What I corrected

The brief has a small tension: Goal 1 mentions managers logging new requests, while the more specific Goal 3 says both managers and contractors can create them. I chose the explicit Goal 3 behavior while retaining server-side assignment-based visibility for contractors. This interpretation is recorded rather than silently assumed.

## Building and verifying the application

### Prompt

“then lets make this project”

### What I got

The assistant implemented a single-service TypeScript application in vertical slices: relational schema and seed data; session login and role middleware; units and rent; maintenance lifecycle, assignment, and audit history; server-side finding; dashboard; alerts; responsive styling; tests; and deployment packaging.

### What I corrected

The first dependency choice, `better-sqlite3`, failed because its native module needed build tools that were not present. I replaced it with Node 24’s built-in `node:sqlite` and wrote an explicit transaction helper. Smoke testing then exposed that Node’s SQLite binding rejects unused named parameters, unlike the first driver. I corrected the manager queries to bind only parameters present in their SQL, rebuilt, and reran both role-based HTTP checks and domain tests.

During the first Render build, pnpm correctly rejected an unapproved `esbuild` postinstall script. The approval lived in `pnpm-workspace.yaml`, but the Docker build copied that file only after dependency installation. I moved the workspace configuration into both dependency-copy layers and redeployed from the resulting corrective commit.
