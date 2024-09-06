
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
        'npmPublish': false,
        'pkgRoot': `${process.env.ARTIFACT_PATH}`,
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
