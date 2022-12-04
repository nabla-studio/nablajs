const name = 'wif';
const srcRoot = `packages/${name}`;

module.exports = {
	extends: 'release.config.base.js',
	pkgRoot: `dist/${srcRoot}`,
	tagFormat: name + '-v${version}',
	commitPaths: [`${srcRoot}/*`],
	branches: [
		'main',
		{
			name: 'next',
			prerelease: true,
		},
		{
			name: 'beta',
			prerelease: true,
		},
		{
			name: 'alpha',
			prerelease: true,
		},
	],
	plugins: [
		'@semantic-release/commit-analyzer',
		'@semantic-release/release-notes-generator',
		[
			'@semantic-release/changelog',
			{
				changelogFile: `${srcRoot}/CHANGELOG.md`,
			},
		],
		'@semantic-release/npm',
		[
			'@semantic-release/git',
			{
				assets: [`${srcRoot}/package.json`, `${srcRoot}/CHANGELOG.md`],
				message:
					`release(version): Release ${name} ` +
					'${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
			},
		],
	],
};
