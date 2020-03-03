"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const github_1 = require("@actions/github");
function actionInputs(env) {
    const { GITHUB_SHA, GITHUB_EVENT_PATH, INPUT_REPO_TOKEN, GITHUB_WORKSPACE, INPUT_ELM_ROOT_DIRECTORY, } = env;
    if (!INPUT_ELM_ROOT_DIRECTORY) {
        throw new Error('`elm_root_directory` input not set.');
    }
    if (!INPUT_REPO_TOKEN) {
        throw new Error('INPUT_REPO_TOKEN environment variable is missing.');
    }
    if (!GITHUB_WORKSPACE) {
        throw new Error('GITHUB_WORKSPACE environment variable is missing.');
    }
    if (!GITHUB_SHA) {
        throw new Error('GITHUB_SHA environment variable is missing.');
    }
    if (!GITHUB_EVENT_PATH) {
        throw new Error('GITHUB_EVENT_PATH environment variable is missing.');
    }
    const github = new github_1.GitHub(INPUT_REPO_TOKEN);
    const event = require(GITHUB_EVENT_PATH);
    return {
        workspaceDirectory: GITHUB_WORKSPACE,
        elmRootDirectory: INPUT_ELM_ROOT_DIRECTORY,
        headSha: event.pull_request.head.sha,
        repoOwner: event.repository.owner.login,
        repoName: event.repository.name,
        github,
    };
}
exports.default = actionInputs;
//# sourceMappingURL=inputs.js.map