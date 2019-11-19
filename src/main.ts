import * as core from '@actions/core'
import { analyse } from './analyse'
import { createCheckRun } from './checks'

async function run() {
  try {
    const workspaceDirectory = process.env.GITHUB_WORKSPACE || ''
    const elmRootDirectory = process.env.INPUT_ELM_ROOT_DIRECTORY || ''
    const issuesPromise = analyse(workspaceDirectory, elmRootDirectory)
    await createCheckRun(elmRootDirectory, issuesPromise)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
