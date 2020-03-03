import * as Analysis from 'elm-analyse/ts/domain'
import { Annotation, Range } from './checks'
import * as path from 'path'

export default function analysisAnnotations(
  report: Analysis.Report,
  elmRootDirectory: string,
) {
  const messages = report.messages.map(message =>
    annotationForMessage(elmRootDirectory, message),
  )
  const unusedDependencies = report.unusedDependencies.map(dep =>
    annotationForUnusedDependency(elmRootDirectory, dep),
  )
  return messages.concat(unusedDependencies)
}

function annotationForUnusedDependency(
  elmRootDirectory: string,
  dependency: string,
): Annotation {
  return {
    annotation_level: 'warning',
    message: `Unused dependency: ${dependency}`,
    path: path.join(elmRootDirectory, 'elm.json'),
    start_line: 0,
    end_line: 0,
  }
}

function annotationForMessage(
  elmRootDirectory: string,
  message: Analysis.Message,
): Annotation {
  const [
    startLine,
    startColumn,
    endLine,
    endColumn,
  ] = message.data.properties.range
  const ending = new RegExp(
    `\\.?( [Aa]t)? \\(\\(${startLine},${startColumn}\\),\\(${endLine},${endColumn}\\)\\)$`,
  )
  const description = message.data.description.replace(ending, '.')

  return {
    annotation_level: 'warning',
    message: description,
    raw_details: JSON.stringify(message),
    path: path.join(elmRootDirectory, message.file),
    ...rangeForMessage(message),
  }
}

function rangeForMessage(message: Analysis.Message): Range {
  const [
    startLine,
    startColumn,
    endLine,
    endColumn,
  ] = message.data.properties.range
  if (startLine == endLine) {
    return {
      start_line: startLine,
      end_line: endLine,
      start_column: startColumn,
      end_column: endColumn,
    }
  } else {
    return {
      start_line: startLine,
      end_line: endLine,
    }
  }
}
