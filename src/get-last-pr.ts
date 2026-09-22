import {PR} from './types/pull-request'

interface Options {
  draft?: boolean
  closed?: boolean
  preferWithHeadSha?: string
  branchLabel?: string
}

const Defaults: Options = {
  draft: true,
  closed: true
}

function findByHeadSha(pullRequests: PR[], sha: string): PR | undefined {
  return pullRequests.find(pullRequest => pullRequest.head.sha.startsWith(sha))
}

export default function getLastPullRequest(
  pullRequests: PR[],
  options: Options
): PR | null {
  options = {...Defaults, ...options}

  const filteredPRs = pullRequests
    .filter(({state}) => state === 'open' || !!options.closed)
    .filter(({draft}) => !draft || !!options.draft)
    .filter(
      ({head}) => !options.branchLabel || head.label === options.branchLabel
    )

  if (filteredPRs.length === 0) return null

  const defaultChoice = filteredPRs[0]
  const preferredChoice =
    options.preferWithHeadSha !== undefined
      ? findByHeadSha(filteredPRs, options.preferWithHeadSha)
      : null
  return preferredChoice || defaultChoice
}
