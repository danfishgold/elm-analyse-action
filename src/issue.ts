import { Message } from 'elm-analyse/ts/domain'

export interface Issue {
  file: string
  type: string
  description: string
  range: Range
}

export type Range = SingleLineRange | MultiLineRange

export interface MultiLineRange {
  type: 'multi-line'
  startLine: number
  endLine: number
}
export interface SingleLineRange {
  type: 'single-line'
  line: number
  startColumn: number
  endColumn: number
}

export function issueFromMessage(message: Message): Issue {
  const [
    startLine,
    startColumn,
    endLine,
    endColumn,
  ] = message.data.properties.range
  const ending = new RegExp(
    `\.? [Aa]t \\(\\(${startLine},${startColumn}\\),\\(${endLine},${endColumn}\\)\\)$`,
  )
  const description = message.data.description.replace(ending, '.')
  let range: Range
  if (startLine === endLine) {
    range = {
      type: 'single-line',
      line: startLine,
      startColumn,
      endColumn,
    }
  } else {
    range = {
      type: 'multi-line',
      startLine,
      endLine,
    }
  }
  return {
    file: message.file,
    type: message.type,
    description,
    range,
  }
}

export function issueToCheckAnnotation(
  issue: Issue,
): GitHub.ChecksUpdateParamsOutputAnnotations {}
