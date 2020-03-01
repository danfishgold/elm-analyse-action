import { GitHub } from '@actions/github'

// ChecksUpdateParamsOutputAnnotations from @octokit
export interface Annotation extends Range {
  annotation_level: 'notice' | 'warning' | 'failure'
  message: string
  title?: string
  raw_details?: string
  path: string
}

export interface Range {
  start_line: number
  start_column?: number
  end_line: number
  end_column?: number
}

export default class CheckRun {
  github: GitHub
  elmRootDirectory: string
  owner: string
  repo: string
  headSha: string
  checkRunId: number

  private constructor(
    github: GitHub,
    owner: string,
    repo: string,
    headSha: string,
    elmRootDirectory: string,
    checkRunId: number,
  ) {
    this.github = github
    this.owner = owner
    this.repo = repo
    this.headSha = headSha
    this.elmRootDirectory = elmRootDirectory
    this.checkRunId = checkRunId
  }

  static async start(
    github: GitHub,
    owner: string,
    repo: string,
    headSha: string,
    elmRootDirectory: string,
  ) {
    const checkRun = await github.checks.create({
      owner,
      repo,
      head_sha: headSha,
      name: 'elm-analyse',
      status: 'in_progress',
      started_at: new Date().toISOString(),
    })

    return new CheckRun(
      github,
      owner,
      repo,
      headSha,
      elmRootDirectory,
      checkRun.data.id,
    )
  }

  async finish(annotations: Annotation[]) {
    const output = {
      annotations,
      title: '`elm-analyse` report',
      summary: this.checkSummary(annotations.length),
    }
    const conclusion = annotations.length == 0 ? 'success' : 'failure'
    await this.github.checks.update({
      owner: this.owner,
      repo: this.repo,
      check_run_id: this.checkRunId,
      status: 'completed',
      conclusion,
      output,
      completed_at: new Date().toISOString(),
    })
  }

  async fail() {
    await this.github.checks.update({
      owner: this.owner,
      repo: this.repo,
      check_run_id: this.checkRunId,
      conclusion: 'failure',
    })
  }

  checkSummary(annotationCount: number): string {
    if (annotationCount == 0) {
      return 'No issues found'
    } else if (annotationCount == 1) {
      return 'One issue found'
    } else {
      return `${annotationCount} issues found`
    }
  }
}
