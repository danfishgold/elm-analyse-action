import * as core from '@actions/core'
import { analyse, Issue } from './analyse'

async function run() {
  try {
    const issues: Issue[] = await analyse('path to directory with elm.json')
    core.debug(JSON.stringify(issues))
  } catch (error) {
    core.setFailed(error)
  }
}

run()
