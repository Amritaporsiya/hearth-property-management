# AI assistance log

I used AI as an implementation and debugging aid during this time-boxed project. I directed the work from the assignment requirements, reviewed the generated changes, chose the final trade-offs, tested the important business rules, and corrected results that did not match the application. I remain responsible for the submitted code and the decisions recorded below.

## Understanding and planning the assignment

### Prompt

“We are pleased to share your Take-Home Project Assignment… Please go through README.md carefully before starting.” Followed by: “then lets make this project”.

### What I got

AI helped me turn the brief and documentation templates into a staged implementation plan covering the ten required goals.

### What I corrected

I reviewed a tension in the brief: Goal 1 mentions managers logging new requests, while the more specific Goal 3 says both managers and contractors can create them. I chose the explicit Goal 3 behavior while retaining server-side assignment-based visibility for contractors.

## Building and verifying the application

### Prompt

“then lets make this project”

### What I got

AI accelerated scaffolding and implementation across the planned vertical slices: relational schema and seed data; authentication and role middleware; units and rent; maintenance lifecycle, assignment, and audit history; server-side search; dashboard; alerts; responsive styling; tests; and deployment packaging. I reviewed the behavior against each goal and iterated on failures.

### What I corrected

The first suggested dependency, `better-sqlite3`, failed because its native module needed build tools that were not present. I evaluated the failure and replaced it with Node 24’s built-in `node:sqlite`, retaining relational constraints and explicit transactions. Smoke testing then showed that Node’s SQLite binding rejects unused named parameters. I corrected the affected manager queries, rebuilt, and reran the role-based HTTP and domain tests.

During the first Render build, pnpm correctly rejected an unapproved `esbuild` postinstall script. The approval lived in `pnpm-workspace.yaml`, but the Docker build copied that file only after dependency installation. I moved the workspace configuration into both dependency-copy layers and redeployed from the resulting corrective commit.

After deployment, live login redirected back to the sign-in form. The password was valid, but the production session used a secure cookie while Express did not trust Render's HTTPS reverse proxy, so the cookie was never issued. I enabled one trusted proxy hop only in production and added a session-retention integration test before redeploying.

## Production verification and submission preparation

### Prompt

“Test everything from deployed link and check if everything working or not.”

### What I got

AI helped generate a disposable production smoke-test flow. I used it to exercise manager login, protected pages, unit creation and editing, rent recording and CSV export, maintenance creation, assignment, notes, every lifecycle transition, contractor visibility, role restrictions, archiving, and logout.

### What I corrected

The first smoke-test run reported a unit-edit failure, but the application was not the cause. The test's broad HTML regular expression selected the ID from the previous unit card. I narrowed the parser to one complete card and reran it. A second assertion expected the contractor list to display “Request #ID,” while the actual list intentionally displays the description and links to the ID. I corrected the assertion to verify the request link. The final production run passed all 52 checks, and disposable units were archived.

## Correcting Git attribution

### Prompt

“Correct it, remove my commits and make all commits her.”

### What I got

AI helped diagnose why published commits showed the laptop owner's identity even though the browser was authenticated as the repository owner. The cause was the repository's local Git name and email. I authorized correcting the six commits and publishing the corrected `main` history.

### What I corrected

Because the owner's public profile did not expose a name or email, I used GitHub's verified private-email form, `85431408+Amritaporsiya@users.noreply.github.com`. I then verified through GitHub's API that every published commit links to the `Amritaporsiya` account and configured this repository to use that identity for future commits.
