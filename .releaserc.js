
console.log('BUILD_ARTIFACT ', process.env.BUILD_ARTIFACT, process.env.GITHUB_WORKSPACE)

module.exports = {
  private: true,
  branches: ['main'],
  plugins: [
    '@semantic-release/commit-analyzer', 
    '@semantic-release/release-notes-generator', 
    '@semantic-release/changelog',
    [
      '@semantic-release/npm',
      {
        'pkgRoot': `${process.env.ARTIFACT_PATH}`,
        'npmPublish': false,
        'tarballDir': 'source'
      }
    ],
    [
      '@semantic-release/github',
      {
        assets: [
          'CHANGELOG.md',
          'source/*.tgz'
        ],
      }
    ]
  ]
}
