"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = __importStar(require("path"));
function analysisAnnotations(report, elmRootDirectory) {
    const messages = report.messages.map(message => annotationForMessage(elmRootDirectory, message));
    const unusedDependencies = report.unusedDependencies.map(dep => annotationForUnusedDependency(elmRootDirectory, dep));
    return messages.concat(unusedDependencies);
}
exports.default = analysisAnnotations;
function annotationForUnusedDependency(elmRootDirectory, dependency) {
    return {
        annotation_level: 'warning',
        message: `Unused dependency: ${dependency}`,
        path: path.join(elmRootDirectory, 'elm.json'),
        start_line: 0,
        end_line: 0,
    };
}
function annotationForMessage(elmRootDirectory, message) {
    const [startLine, startColumn, endLine, endColumn,] = message.data.properties.range;
    const ending = new RegExp(`\\.?( [Aa]t)? \\(\\(${startLine},${startColumn}\\),\\(${endLine},${endColumn}\\)\\)$`);
    const description = message.data.description.replace(ending, '.');
    return Object.assign({ annotation_level: 'warning', message: description, raw_details: JSON.stringify(message), path: path.join(elmRootDirectory, message.file) }, rangeForMessage(message));
}
function rangeForMessage(message) {
    const [startLine, startColumn, endLine, endColumn,] = message.data.properties.range;
    if (startLine == endLine) {
        return {
            start_line: startLine,
            end_line: endLine,
            start_column: startColumn,
            end_column: endColumn,
        };
    }
    else {
        return {
            start_line: startLine,
            end_line: endLine,
        };
    }
}
//# sourceMappingURL=analysis-annotations.js.map