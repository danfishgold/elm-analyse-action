import { ElmApp, Config, Report } from 'elm-analyse/ts/domain'
import * as fileLoadingPorts from 'elm-analyse/dist/app/file-loading-ports'
import * as loggingPorts from 'elm-analyse/dist/app/util/logging-ports'
import * as dependencies from 'elm-analyse/dist/app/util/dependencies'
import { Elm } from 'elm-analyse/dist/app/backend-elm'
import { Issue, issueFromMessage } from './issue'
import * as path from 'path'
import * as fs from 'fs'
import util from 'util'
const readFile = util.promisify(fs.readFile)

/// This is pretty much the start method from elm-analyse/ts/analyser.ts but
/// without the hardcoded reporter, because it console.logs the result,
/// whereas we want to keep the outputted json report.
function runAnalyser(
  directory: string,
  config: Config,
  project: {},
): Promise<Report> {
  return new Promise(resolve => {
    dependencies.getDependencies(function(registry: any) {
      const app: ElmApp = Elm.Analyser.init({
        flags: {
          server: false,
          registry: registry || [],
          project: project,
        },
      })

      const onReport = (report: Report) => {
        resolve(report)
        app.ports.sendReportValue.unsubscribe(onReport)
      }
      app.ports.sendReportValue.subscribe(onReport)

      loggingPorts.setup(app, config)
      // elm-analyse breaks if there is a trailing slash on the path, it tries to
      // read <dir>//elm.json instead of <div>/elm.json
      fileLoadingPorts.setup(app, config, directory.replace(/[\\/]?$/, ''))
    })
  })
}

export async function analyse(directory: string): Promise<Issue[]> {
  const elmJsonPath = path.join(directory, 'elm.json')
  const project = await readFile(elmJsonPath, {
    encoding: 'utf-8',
  }).then(JSON.parse)

  const config = {
    port: 0,
    elmFormatPath: 'elm-format',
    format: 'json',
    open: false,
  }

  const report = await runAnalyser(directory, config, project)
  return report.messages.map(issueFromMessage)
}
