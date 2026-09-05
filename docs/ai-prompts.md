# AI Prompts

## Understanding and Planning the Assignment

### Prompt

“We are pleased to share your Take-Home Project Assignment… Please go through README.md carefully before starting.”

Followed by:

“Then let’s make this project.”

### How I Used AI

I used AI initially to help me understand the assignment requirements and clarify what each goal was asking for. It helped me break the requirements into smaller tasks and discuss possible approaches before I started implementing them.

### What I Did

I went through the README and documentation templates myself and planned the application based on the given requirements. I also identified an ambiguity between Goal 1 and Goal 3 regarding who should be allowed to create maintenance requests.

I decided to follow the more specific requirement in Goal 3, allowing both managers and contractors to create requests while maintaining assignment-based visibility for contractors.

---

## Building and Developing the Application

### Prompt

“Then let’s make this project.”

### How I Used AI

During development, I primarily used AI as a coding assistant when I was stuck on a problem or needed clarification. I asked it to explain errors, suggest possible solutions, review specific parts of my implementation, and help me understand unfamiliar concepts.

I did not rely on AI to independently build the complete application. I worked through the different features myself and used AI mainly when I needed assistance.

### What I Did

I developed the application feature by feature and tested each part as I progressed. I worked on the database, authentication and authorization, unit and rent management, maintenance workflows, dashboards, alerts, testing, and deployment.

Whenever I encountered an issue, I investigated it and used AI to help identify possible causes and solutions.

For example, I initially encountered problems with `better-sqlite3` because its native module required build tools that were unavailable in my environment. I researched the issue and decided to move to Node 24's built-in `node:sqlite`. I then adjusted the database implementation and added the required transaction handling.

While testing the new SQLite implementation, I encountered another issue where unused named parameters were rejected. I used AI to understand the error and then corrected the affected queries so that only the parameters actually required by each SQL statement were passed.

I followed the same process during deployment. When the Render build failed because pnpm rejected an `esbuild` postinstall script, I investigated the Docker build process and identified that the workspace configuration was being copied too late. I corrected the Docker configuration and redeployed the application.

After deployment, I also tested the login functionality and discovered that the production session was not being retained. I investigated the cookie and proxy configuration and identified the issue with Express not trusting Render's HTTPS reverse proxy. I corrected the production configuration and added a test to verify session retention.

---

## Production Testing and Verification

### Prompt

“Test everything from deployed link and check if everything working or not.”

### How I Used AI

I used AI to help me prepare a structured checklist for testing the deployed application and to suggest edge cases that I should verify.

### What I Did

I personally tested the major application workflows, including:

* Manager login and logout
* Protected routes
* Unit creation and editing
* Rent recording and CSV export
* Maintenance request creation
* Assignment and reassignment
* Maintenance notes
* Request status transitions
* Contractor access restrictions
* Archiving
* Role-based permissions

During testing, I investigated the failures rather than assuming they were application bugs.

For example, the first smoke test reported a unit-edit failure. After checking the test logic, I found that the HTML parser was selecting an ID from a previous unit card because the regular expression was too broad. I narrowed the parser to the correct card and reran the test.

Another test had an incorrect expectation about how contractor requests were displayed. I checked the actual application behavior and updated the assertion to verify the request link instead.

After making the corrections, I reran the complete production test suite. All 52 checks passed, and I verified that the temporary test data was archived.

---

## Git Attribution and Repository Configuration

### Prompt

“Correct it, remove my commits and make all commits mine.”

### How I Used AI

I used AI to help me understand the Git history and diagnose why the commits were associated with the wrong Git identity. It also helped me determine the commands required to correct the repository configuration and history.

### What I Did

I inspected the repository's Git configuration and found that the local Git identity was different from the GitHub account being used for the project.

I corrected the Git author information, updated the commit history, and pushed the corrected history to the repository.

Because the GitHub profile did not publicly expose the required email address, I used the verified GitHub private-email format associated with my account:

`85431408+Amritaporsiya@users.noreply.github.com`

I then verified the published commits and configured the repository to use the correct Git identity for future commits.

---

## Overall Use of AI

AI was used throughout the project as a **supporting development and debugging tool**. My primary workflow was to understand the requirement, implement the feature, test it, identify problems, and then use AI when I needed additional clarification or assistance.

AI was particularly useful for explaining unfamiliar errors, suggesting debugging approaches, reviewing specific implementation decisions, and helping me troubleshoot deployment and testing issues.

The overall development process was:

**Understand → Implement → Test → Debug → Use AI when needed → Fix → Retest**

This allowed me to remain involved in the implementation, debugging, testing, and decision-making throughout the project while using AI to improve my development process.
