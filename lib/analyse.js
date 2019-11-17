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
const fileLoadingPorts = __importStar(require("elm-analyse/dist/app/file-loading-ports"));
const loggingPorts = __importStar(require("elm-analyse/dist/app/util/logging-ports"));
const dependencies = __importStar(require("elm-analyse/dist/app/util/dependencies"));
const backend_elm_1 = require("elm-analyse/dist/app/backend-elm");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const util_1 = __importDefault(require("util"));
const readFile = util_1.default.promisify(fs.readFile);
/// This is pretty much the start method from elm-analyse/ts/analyser.ts but
/// without the hardcoded reporter, because it console.logs the result,
/// whereas we want to keep the outputted json report.
function runAnalyser(directory, config, project) {
    return new Promise(resolve => {
        dependencies.getDependencies(function (registry) {
            const app = backend_elm_1.Elm.Analyser.init({
                flags: {
                    server: false,
                    registry: registry || [],
                    project: project,
                },
            });
            const onReport = (report) => {
                resolve(report);
                app.ports.sendReportValue.unsubscribe(onReport);
            };
            app.ports.sendReportValue.subscribe(onReport);
            loggingPorts.setup(app, config);
            // elm-analyse breaks if there is a trailing slash on the path, it tries to
            // read <dir>//elm.json instead of <div>/elm.json
            fileLoadingPorts.setup(app, config, directory.replace(/[\\/]?$/, ''));
        });
    });
}
function issueFromMessage(message) {
    const [startRow, startColumn, endRow, endColumn,] = message.data.properties.range;
    const ending = new RegExp(` [Aa]t \\(\\(${startRow},${startColumn}\\),\\(${endRow},${endColumn}\\)\\)$`);
    const cleanerDescription = message.data.description.replace(ending, '');
    return {
        file: message.file,
        type: message.type,
        description: cleanerDescription,
        lineRange: {
            start: startRow,
            end: endRow,
        },
    };
}
function analyse(directory) {
    return __awaiter(this, void 0, void 0, function* () {
        const elmJsonPath = path.join(directory, 'elm.json');
        const project = yield readFile(elmJsonPath, {
            encoding: 'utf-8',
        }).then(JSON.parse);
        const config = {
            port: 0,
            elmFormatPath: 'elm-format',
            format: 'json',
            open: false,
        };
        const report = yield runAnalyser(directory, config, project);
        return report.messages.map(issueFromMessage);
    });
}
exports.analyse = analyse;
//# sourceMappingURL=analyse.js.map