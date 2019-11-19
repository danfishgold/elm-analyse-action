import { GitHub } from '@actions/github'
import { Issue } from './issue'
import * as path from 'path'

const { GITHUB_SHA, GITHUB_EVENT_PATH, INPUT_REPO_TOKEN } = process.env

const github = new GitHub(INPUT_REPO_TOKEN || '')

const event = require(GITHUB_EVENT_PATH || '')
const repository = event.repository
const owner = repository.owner.login
const repo = repository.name
// const pull_number = event.number

export async function createCheckRun(
  elmRootDirectory: string,
  issuesPromise: Promise<Issue[]>,
) {
  const checkRun = await github.checks.create({
    owner,
    repo,
    head_sha: GITHUB_SHA || '',
    name: 'elm-analyse',
    status: 'in_progress',
    started_at: new Date().toISOString(),
  })

  const annotations = (await issuesPromise).map(issue =>
    annotationFromIssue(elmRootDirectory, issue),
  )
  const conclusion = 'success'
  const output = {
    annotations,
    summary: 'summary',
    text: 'text',
    title: 'title',
  }

  await github.checks.update({
    owner,
    repo,
    check_run_id: checkRun.data.id,
    status: 'completed',
    conclusion,
    output,
    completed_at: new Date().toISOString(),
  })

  // const files = await github.pulls.listFiles({
  //   owner,
  //   repo,
  //   pull_number,
  // })
}

// ChecksUpdateParamsOutputAnnotations from @octokit
interface Annotation {
  annotation_level: 'notice' | 'warning' | 'failure'
  end_column?: number
  end_line: number
  message: string
  path: string
  raw_details?: string
  start_column?: number
  start_line: number
  title?: string
}

function range(
  issue: Issue,
): {
  start_line: number
  end_line: number
  start_column?: number
  end_column?: number
} {
  switch (issue.range.type) {
    case 'multi-line':
      return {
        start_line: issue.range.startLine,
        end_line: issue.range.endLine,
      }
    case 'single-line':
      return {
        start_line: issue.range.line,
        end_line: issue.range.line,
        start_column: issue.range.startColumn,
        end_column: issue.range.endColumn,
      }
  }
}

function annotationFromIssue(
  elmRootDirectory: string,
  issue: Issue,
): Annotation {
  return {
    annotation_level: 'notice',
    message: `message for ${issue.description}`,
    path: path.join(elmRootDirectory, issue.file),
    raw_details: `raw details for ${issue.description}`,
    title: `title for ${issue.description}`,
    ...range(issue),
  }
}
