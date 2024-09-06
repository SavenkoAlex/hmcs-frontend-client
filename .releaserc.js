
console.log('BUILD_ARTIFACT ', process.env.BUILD_ARTIFACT, process.env.GITHUB_WORKSPACE)

module.exports = {
  private: true,
  branches: ['main'],
  plugins: [
    '@semantic-release/commit-analyzer', 
    '@semantic-release/release-notes-generator', 
    '@semantic-release/changelog',
    [
      '@semantic-release/github',
      {
        assets: [
          'CHANGELOG.md',
          [
            `${process.env.ARTIFACT_PATH}/**/*`,
            {
              name: `source-${nextRelease.gitTag}`
            }
          ]
        ],
      }
    ]
  ]
}
