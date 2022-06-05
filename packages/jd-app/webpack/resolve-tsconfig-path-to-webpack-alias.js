const { resolve } = require('path');

/**
 * Resolve tsconfig.json paths to Webpack aliases
 */
function resolveTsconfigPathsToAlias({
     tsconfigPath = '../tsconfig.json',
     webpackConfigBasePath = __dirname,
 } = {}) {
    const { paths, baseUrl } = require(tsconfigPath).compilerOptions;

    const aliases = {};

    Object.keys(paths).forEach((item) => {
        const key = item.replace('/*', '');
        const value = resolve(webpackConfigBasePath, '..', baseUrl, paths[item][0].replace('/*', '').replace('*', ''));

        aliases[key] = value;
    });

    return aliases;
}

module.exports = resolveTsconfigPathsToAlias;