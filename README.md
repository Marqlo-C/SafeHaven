# Product Requirements Document (PRD): Modular Feature System

## 1. Overview
The goal of this system is to provide a highly decoupled, modular architecture for a Node.js web application. By using a **Feature Toggle** pattern, developers can integrate new functionality into the codebase without affecting the production environment until explicitly enabled. This ensures the `main` branch remains stable while allowing for continuous integration of new features.

## 2. Technical Architecture
The system follows a specific pipeline for managing and initializing features:

### A. Configuration Storage (`config.json`)
All non-sensitive feature toggles are stored in this declarative JSON file.
*   **Purpose**: Act as a centralized "on/off" switchboard for the entire team.
*   **Format**: A standard JSON object with boolean flags.
*   **Example**:
    ```json
    {
      "enable_safety_alert_feature": false,
      "enable_community_forum": true
    }
    ```

### B. Configuration Parsing (`config.js`)
This module acts as the "Bridge" and **Singleton** for the application's settings.
*   **Process**: It uses `require` to pull in static flags from `config.json` and utilizes the `dotenv` package to load sensitive environment variables from `.env`.
*   **Output**: It exports a unified `config` module that provides a single source of truth for the entire program.
*   **Role**: Merges shareable toggles (GitHub-tracked) with local secrets (local-only).

### C. Application Initialization (`app.js`)
This is the central orchestrator where features are conditionally activated.
*   **Workflow**:
    1.  Import the unified `config` module.
    2.  Import required feature modules using `require`.
    3.  Check the relevant feature toggle within an `if` statement.
    4.  If enabled, call the feature's mandatory initialization method.

## 3. Functional Requirements
To maintain modularity and prevent application crashes, all new features must adhere to the following standards:

### Feature Class Structure
Every new feature must be encapsulated within its own class.
*   **Mandatory Method**: Each feature class **must** include an `init()` method.
*   **Responsibility**: The `init()` method handles all internal setup, such as registering routes, connecting to specific database tables, or initializing third-party APIs.

### Feature Activation Logic
Features are activated in `app.js` using the following pattern:
1.  **Import**: `const { FeatureClass } = require('./my-project/src/features/feature_name');`
2.  **Conditional Check**:
    ```javascript
    if (config.features.enable_feature_name) {
        FeatureClass.init();
    }
    ```

## 4. Design Principles
*   **Lean Core**: The `main` file remains as small as possible, acting only as a librarian that calls external modules.
*   **Fail-Safe**: If a feature is disabled in `config.json`, no part of its code executes, ensuring unfinished features cannot compromise the production environment.
*   **Singleton Pattern**: By requiring `config.js` across different files, the application uses a cached, single instance of settings, optimizing performance for your hardware.

## 4. Collaborative Git Workflow
Collaborators must follow these steps for all feature development:

### I. Branch Creation
Every time you create a new feature, start by creating a dedicated branch:
```bash
git checkout -b feature/feature_name
```

### II. Development and Upstream Push
When your changes are ready to be pushed to the remote repository:
```bash
git add feature_name.js
git commit -m "brief description of feature"
git push origin feature/feature_name
```

### III. Pull Request (PR)
Go to GitHub and open a Pull Request to merge your feature branch into the `main` branch. This is the only way to integrate code into the stable codebase.

### IV. Continuous Development
Keep your local feature branch alive during the PR review process. To start a different feature, return to the `main` branch and repeat the creation process:
```bash
git checkout main
```

### V. Branch Cleanup
Once features are successfully implemented in `origin/main` (i.e., the PR is approved and validated as working), delete your local branch:
```bash
# Standard safe delete
git branch -d feature/feature_name

# Force delete (Use only if absolutely necessary; ask Lead before using)
git branch -D feature/feature_name
```

## 5. Design Principles
*   **Lean Core**: The `main` file remains as small as possible, acting only as a librarian that calls external modules.
*   **Fail-Safe**: If a feature is disabled in `config.json`, no part of its code executes, ensuring unfinished features cannot compromise the production environment.
*   **Singleton Pattern**: By requiring `config.js` across different files, the application uses a cached, single instance of settings, optimizing performance for our development environments.

