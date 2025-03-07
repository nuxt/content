import { expect, describe, test } from 'vitest'

import { parseBitBucketUrl, parseGitHubUrl } from '../../../src/utils/git'

describe('parseGitHubUrl', () => {
  test('parses a valid GitHub URL with organization and repository', () => {
    const url = 'https://github.com/organization/repository'
    const result = parseGitHubUrl(url)
    expect(result).toEqual({
      org: 'organization',
      repo: 'repository',
      branch: 'main',
      path: '',
    })
  })

  test('parses a valid GitHub URL with trailing slash', () => {
    const url = 'https://github.com/organization/repository/'
    const result = parseGitHubUrl(url)
    expect(result).toEqual({
      org: 'organization',
      repo: 'repository',
      branch: 'main',
      path: '',
    })
  })

  test('parses a valid GitHub URL with additional path segments', () => {
    const url = 'https://github.com/organization/repository/tree/develop/components'
    const result = parseGitHubUrl(url)
    expect(result).toEqual({
      org: 'organization',
      repo: 'repository',
      branch: 'develop',
      path: 'components',
    })
  })

  test('returns null for invalid GitHub URL (missing repository)', () => {
    const url = 'https://github.com/organization'
    const result = parseGitHubUrl(url)
    expect(result).toBeNull()
  })

  test('returns null for non-GitHub URL', () => {
    const url = 'https://gitlab.com/organization/repository'
    const result = parseGitHubUrl(url)
    expect(result).toBeNull()
  })

  test('returns null for malformed URL', () => {
    const url = 'not-a-url'
    const result = parseGitHubUrl(url)
    expect(result).toBeNull()
  })

  test('parses a GitHub URL with feature branch', () => {
    const url = 'https://github.com/organization/repository/tree/feat/something'
    const result = parseGitHubUrl(url)
    expect(result).toEqual({
      org: 'organization',
      repo: 'repository',
      branch: 'feat/something',
      path: '',
    })
  })

  test('parses a GitHub URL with feature branch and path', () => {
    const url = 'https://github.com/organization/repository/tree/feat/something/components'
    const result = parseGitHubUrl(url)
    expect(result).toEqual({
      org: 'organization',
      repo: 'repository',
      branch: 'feat/something',
      path: 'components',
    })
  })
})

describe('parseBitBucketUrl', () => {
  test('parses a valid BitBucket URL with workspace and repository', () => {
    const url = 'https://bitbucket.org/workspace/repository'
    const result = parseBitBucketUrl(url)
    expect(result).toEqual({
      org: 'workspace',
      repo: 'repository',
      branch: 'main',
      path: '',
    })
  })

  test('parses a valid BitBucket URL with trailing slash', () => {
    const url = 'https://bitbucket.org/workspace/repository/'
    const result = parseBitBucketUrl(url)
    expect(result).toEqual({
      org: 'workspace',
      repo: 'repository',
      branch: 'main',
      path: '',
    })
  })

  test('parses a valid BitBucket URL with additional path segments', () => {
    const url = 'https://bitbucket.org/workspace/repository/src/develop/components'
    const result = parseBitBucketUrl(url)
    expect(result).toEqual({
      org: 'workspace',
      repo: 'repository',
      branch: 'develop',
      path: 'components',
    })
  })

  test('returns null for invalid BitBucket URL (missing repository)', () => {
    const url = 'https://bitbucket.org/workspace'
    const result = parseBitBucketUrl(url)
    expect(result).toBeNull()
  })

  test('returns null for non-BitBucket URL', () => {
    const url = 'https://github.com/organization/repository'
    const result = parseBitBucketUrl(url)
    expect(result).toBeNull()
  })

  test('returns null for malformed URL', () => {
    const url = 'not-a-url'
    const result = parseBitBucketUrl(url)
    expect(result).toBeNull()
  })

  test('parses a BitBucket URL with feature branch', () => {
    const url = 'https://bitbucket.org/organization/repository/src/feat/something'
    const result = parseBitBucketUrl(url)
    expect(result).toEqual({
      org: 'organization',
      repo: 'repository',
      branch: 'feat/something',
      path: '',
    })
  })

  test('parses a BitBucket URL with feature branch and path', () => {
    const url = 'https://bitbucket.org/organization/repository/src/feat/something/components'
    const result = parseBitBucketUrl(url)
    expect(result).toEqual({
      org: 'organization',
      repo: 'repository',
      branch: 'feat/something',
      path: 'components',
    })
  })
})
