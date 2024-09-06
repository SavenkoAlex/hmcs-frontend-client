
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
        "npmPublish": false,
        "tarballDir": "dist"
      }
    ],
    [
      '@semantic-release/github',
      {
        assets: [
          'CHANGELOG.md',
          `${process.env.GITHUB_WORKSPACE}/${process.env.BUILD_ARTIFACT}`
        ],
      }
    ]
  ]
}
