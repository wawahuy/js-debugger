// Generated using webpack-cli https://github.com/webpack/webpack-cli

const path = require('path');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');
const NodemonPlugin = require('nodemon-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const resolveTsconfigPathsToAlias = require("./webpack/resolve-tsconfig-path-to-webpack-alias");

const isProduction = process.env.NODE_ENV == 'production';


const externals = () => {
    const devLibs = [
        'bufferutil',
        'utf-8-validate',
        {
            'rn-bridge': 'require(\'rn-bridge\')'
        }
    ];
    const externalLibs = [
    ];
    if (isProduction) {
        const check = lib => {
            return !externalLibs.includes(lib);
        }
        return [...devLibs, nodeExternals({ allowlist: check })]
    }

    // in order to ignore all modules in node_modules folder
    return [nodeExternals()];
}

const config = {
    entry: './src/index.ts',
    target: 'node',
    externals: externals(),
    externalsPresets: {
        node: true // in order to ignore built-in modules like path, fs, etc.
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js'
    },
    plugins: [
        new NodemonPlugin()
    ],
    module: {
        rules: [
            {
                test: /\.ts$/i,
                loader: 'ts-loader',
                exclude: ['/node_modules/'],
            },
            {
                test: /\.txt$/i,
                loader: 'raw-loader'
            },
        ],
    },
    resolve: {
        extensions: ['.ts', '.js', '.jsx'],
        alias: resolveTsconfigPathsToAlias(),
    },
};

module.exports = (env) => {
    if (isProduction) {
        config.mode = 'production';
        config.output.filename = `${env.type}.js`;
        config.plugins.push(
            new webpack.DefinePlugin({
                'process.env.type': JSON.stringify(env.type)
            }),
        )
        config.optimization = {
            minimizer: [
                (compiler) => ({
                    terserOptions: {
                        mangle: false,
                        keep_classnames: /AbortSignal/,
                        keep_fnames: /AbortSignal/
                    }
                })
            ]
        };
        // config.plugins.push(new BundleAnalyzerPlugin());
    } else {
        config.mode = 'development';
    }
    return config;
};
