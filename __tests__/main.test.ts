import {expect, test} from '@jest/globals'
// @ts-ignore
import createDummyPR from './create-dummy-pr'
import getLastPullRequest from '../src/get-last-pr'

test('prefers PR with commit as head SHA', () => {
  const testPRs = [
    createDummyPR(1, {sha: '09e30775c'}),
    createDummyPR(2, {sha: '90775cae3'})
  ]
  const options = {
    preferWithHeadSha: testPRs[1].head.sha
  }
  const foundPR = getLastPullRequest(testPRs, options) || {id: null}
  expect(foundPR.id).toBe(testPRs[1].id)
})

test('filter out draft PRs', () => {
  const testPRs = [createDummyPR(1, {draft: true})]

  const foundPR = getLastPullRequest(testPRs, {draft: false})
  expect(foundPR).toBeNull()
})

test('find a draft PRs', () => {
  const testPRs = [createDummyPR(11, {draft: true})]

  const foundPR = getLastPullRequest(testPRs, {draft: true}) || {id: null}
  expect(foundPR.id).toBe(testPRs[0].id)
})

test('only returns PR matching the branch', () => {
  const testPRs = [
    createDummyPR(1, {sha: 'abc', label: 'owner:feature-a'}),
    createDummyPR(2, {sha: 'abc', label: 'owner:feature-b'})
  ]

  const foundPR = getLastPullRequest(testPRs, {
    preferWithHeadSha: 'abc',
    branchLabel: 'owner:feature-b'
  }) || {id: null}
  expect(foundPR.id).toBe(testPRs[1].id)
})

test('ignores same named branch from a fork', () => {
  const testPRs = [
    createDummyPR(1, {sha: 'abc', label: 'fork-owner:fix'}),
    createDummyPR(2, {sha: 'abc', label: 'owner:fix'})
  ]

  const foundPR = getLastPullRequest(testPRs, {branchLabel: 'owner:fix'}) || {
    id: null
  }
  expect(foundPR.id).toBe(testPRs[1].id)
})

test('returns null when no PR matches the branch', () => {
  const testPRs = [createDummyPR(1, {sha: 'abc', label: 'owner:feature-a'})]

  const foundPR = getLastPullRequest(testPRs, {branchLabel: 'owner:master'})
  expect(foundPR).toBeNull()
})
