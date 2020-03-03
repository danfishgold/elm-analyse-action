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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const inputs_1 = __importDefault(require("./inputs"));
const analyse_1 = __importDefault(require("./analyse"));
const checks_1 = __importDefault(require("./checks"));
const analysis_annotations_1 = __importDefault(require("./analysis-annotations"));
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { workspaceDirectory, elmRootDirectory, headSha, repoOwner, repoName, github, } = inputs_1.default(process.env);
            const checkRun = yield checks_1.default.start(github, repoOwner, repoName, headSha, elmRootDirectory);
            core.warning(headSha);
            try {
                const report = yield analyse_1.default(workspaceDirectory, elmRootDirectory);
                const annotations = analysis_annotations_1.default(report, elmRootDirectory);
                yield checkRun.finish(annotations);
                if (annotations.length > 0) {
                    core.setFailed('elm-analyse found issues in your codebase.');
                }
            }
            catch (error) {
                yield checkRun.fail();
                throw error;
            }
        }
        catch (error) {
            core.setFailed(error.message);
        }
    });
}
run();
//# sourceMappingURL=main.js.map