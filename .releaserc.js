
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
          `${process.env.ARTIFACT_PATH}.tar.gz`
        ],
      }
    ]
  ]
}
