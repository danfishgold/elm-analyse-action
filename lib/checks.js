"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
class CheckRun {
    constructor(github, owner, repo, headSha, elmRootDirectory, checkRunId) {
        this.github = github;
        this.owner = owner;
        this.repo = repo;
        this.headSha = headSha;
        this.elmRootDirectory = elmRootDirectory;
        this.checkRunId = checkRunId;
    }
    static start(github, owner, repo, headSha, elmRootDirectory) {
        return __awaiter(this, void 0, void 0, function* () {
            const checkRun = yield github.checks.create({
                owner,
                repo,
                head_sha: headSha,
                name: 'elm-analyse',
                status: 'in_progress',
                started_at: new Date().toISOString(),
            });
            return new CheckRun(github, owner, repo, headSha, elmRootDirectory, checkRun.data.id);
        });
    }
    updateWithAnnotations(annotations, summary) {
        return __awaiter(this, void 0, void 0, function* () {
            const output = {
                annotations,
                title: 'elm-analyse report',
                summary,
            };
            yield this.github.checks.update({
                owner: this.owner,
                repo: this.repo,
                check_run_id: this.checkRunId,
                status: 'in_progress',
                output,
            });
        });
    }
    finish(annotations) {
        return __awaiter(this, void 0, void 0, function* () {
            const summary = this.checkSummary(annotations.length);
            for (let annotationChunk of chunk(annotations, 50)) {
                yield this.updateWithAnnotations(annotationChunk, summary);
            }
            const conclusion = annotations.length == 0 ? 'success' : 'failure';
            yield this.github.checks.update({
                owner: this.owner,
                repo: this.repo,
                check_run_id: this.checkRunId,
                status: 'completed',
                conclusion,
                completed_at: new Date().toISOString(),
            });
        });
    }
    fail() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.github.checks.update({
                owner: this.owner,
                repo: this.repo,
                check_run_id: this.checkRunId,
                conclusion: 'failure',
            });
        });
    }
    checkSummary(annotationCount) {
        if (annotationCount == 0) {
            return 'No issues found';
        }
        else if (annotationCount == 1) {
            return 'One issue found';
        }
        else {
            return `${annotationCount} issues found`;
        }
    }
}
exports.default = CheckRun;
function chunk(array, chunkSize) {
    if (array.length == 0) {
        return [];
    }
    const head = array.slice(0, chunkSize);
    const tail = array.slice(chunkSize);
    return [head].concat(chunk(tail, chunkSize));
}
//# sourceMappingURL=checks.js.map