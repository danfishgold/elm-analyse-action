import * as core from '@actions/core'
import { analyse, Issue } from './analyse'

async function run() {
  try {
    const issues: Issue[] = await analyse('path to directory with elm.json')
    core.debug(issues.toString())
    // core.setOutput('time', new Date().toTimeString())
  } catch (error) {
    // core.setFailed(error.message)
    core.setFailed(error)
  }
}

run()
