import * as core from '@actions/core'
import actionInputs from './inputs'
import analyse from './analyse'
import CheckRun from './checks'
import analysisAnnotations from './analysis-annotations'

async function run() {
  try {
    const {
      workspaceDirectory,
      elmRootDirectory,
      headSha,
      repoOwner,
      repoName,
      github,
    } = actionInputs(process.env)

    const checkRun = await CheckRun.start(
      github,
      repoOwner,
      repoName,
      headSha,
      elmRootDirectory,
    )
    core.warning(headSha)
    try {
      const report = await analyse(workspaceDirectory, elmRootDirectory)
      const annotations = analysisAnnotations(report, elmRootDirectory)
      await checkRun.finish(annotations)
      if (annotations.length > 0) {
        core.setFailed('elm-analyse found issues in your codebase.')
      }
    } catch (error) {
      await checkRun.fail()
      throw error
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
