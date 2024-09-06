console.log('BUILD_ARTIFACT ', process.env.BUILD_ARTIFACT)
console.log('artifact path ', path.resolve(process.env.GITHUB_WORKSPACE, process.env.BUILD_ARTIFACT))

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
          path.resolve(process.env.GITHUB_WORKSPACE, process.env.BUILD_ARTIFACT)
        ],
      }
    ]
  ]
}
