import * as core from '@actions/core'
import * as github from '@actions/github'
import getInputAsBoolean from './get-input-as-boolean'

type ActionInput = {
  token: string
  sha: string
  filterOutDraft: boolean
  filterOutClosed: boolean
  branchLabel?: string
}

export default function getInputs(): ActionInput {
  const token = core.getInput('github-token', {required: true})
  const triggeredFromPR =
    github.context.eventName === 'pull_request' ||
    github.context.eventName === 'pull_request_target'
  const shaInput = core.getInput('sha')
  const sha =
    shaInput ||
    (triggeredFromPR
      ? github.context.payload.pull_request?.head.sha
      : github.context.sha)
  const filterOutDraft = getInputAsBoolean('filterOutDraft')
  const filterOutClosed = getInputAsBoolean('filterOutClosed')
  const branchLabel = getInputAsBoolean('matchBranch')
    ? getBranchLabel(shaInput)
    : undefined
  return {
    token,
    sha,
    filterOutDraft,
    filterOutClosed,
    branchLabel
  }
}

function getBranchLabel(shaInput: string): string | undefined {
  if (shaInput) {
    core.warning(
      'matchBranch is ignored when sha is set, the workflow branch may not be the branch of that commit'
    )
    return undefined
  }

  const prLabel = github.context.payload.pull_request?.head.label
  if (prLabel) return prLabel
  const {ref} = github.context
  if (!ref.startsWith('refs/heads/')) {
    core.warning(`matchBranch is ignored because ${ref} is not a branch`)
    return undefined
  }
  return `${github.context.repo.owner}:${ref.slice('refs/heads/'.length)}`
}
