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
      {
        "path": "@semantic-release/github",
        "assets": [
          { path: 'dist/assets/dist', label: 'frontend build' },
          "CHANGELOG.md"
        ],
        message: 'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}'
      }
    ]
  }
}
