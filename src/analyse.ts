import { ElmApp, FixedFile, Message, Report } from 'elm-analyse/ts/domain'
import * as fileLoadingPorts from 'elm-analyse/dist/app/file-loading-ports'
import { Elm } from 'elm-analyse/dist/app/backend-elm'
import * as fs from 'fs'
import util from 'util'
const readFile = util.promisify(fs.readFile)
import * as path from 'path'

export interface Issue {
  file: string
  type: string
  description: string
  lineRange: {
    start: number
    end: number
  }
}

function issueFromMessage(message: Message): Issue {
  const [
    startRow,
    startColumn,
    endRow,
    endColumn,
  ] = message.data.properties.range
  const ending = new RegExp(
    ` [Aa]t \\(\\(${startRow},${startColumn}\\),\\(${endRow},${endColumn}\\)\\)$`,
  )
  const cleanerDescription = message.data.description.replace(ending, '')
  return {
    file: message.file,
    type: message.type,
    description: cleanerDescription,
    lineRange: {
      start: startRow,
      end: endRow,
    },
  }
}

export async function analyse(directory: string): Promise<Issue[]> {
  const elmJsonPath = path.join(directory, 'elm.json')
  const elmJson = await readFile(elmJsonPath, {
    encoding: 'utf-8',
  }).then(JSON.parse)
  const elmAnalyse: ElmApp = Elm.Analyser.init({
    flags: {
      project: elmJson,
      registry: [],
      server: false,
    },
  })

  // elm-analyse breaks if there is a trailing slash on the path, it tries to
  // read <dir>//elm.json instead of <div>/elm.json
  fileLoadingPorts.setup(elmAnalyse, {}, directory.replace(/[\\/]?$/, ''))

  return new Promise(resolve => {
    // Wait for elm-analyse to send back the report
    const reportCallback = (report: Report) => {
      // Then unsubscribe
      elmAnalyse.ports.sendReportValue.unsubscribe(reportCallback)
      resolve(report.messages.map(issueFromMessage))
    }
    elmAnalyse.ports.sendReportValue.subscribe(reportCallback)
  })
}
