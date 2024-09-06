module.exports = {
  private: true,
  branches: ['main'],
  plugins: [
    '@semantic-release/commit-analyzer', 
    '@semantic-release/release-notes-generator', 
    '@semantic-release/changelog',
    '@semantic-release/github',
  ],
  release: {
    prepare: [
      '@semantic-release/changelog',
      '@semantic-release/npm',
      {
        "npmPublish": false,
        "tarballDir": "dist"
      },
      {
        path: '@semantic-release/github',
        assets: [
          'CHANGELOG.md',
          'dist/*.*'
        ],
      },

    ]
  }
}
