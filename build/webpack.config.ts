import webpack, { ChunkData, Configuration } from 'webpack';
import * as path from 'path';
import { Options } from 'file-loader';
import { Options as TsOptions } from 'ts-loader';
import ForkTsCechkerWebpackPlugin from 'fork-ts-checker-webpack-plugin';

const root = process.cwd();
const config: Configuration = {
    mode: 'development',
    output: {
        libraryTarget: 'commonjs2',
        filename: 'extension.js',
    },
    entry: path.join(root, 'src/extension.ts'),
    module: {
        rules: [
            {
                exclude: /node_modules|\.d\.ts$/,
                test: /\.tsx?$/,
                use: [
                    {
                        loader: 'ts-loader',
                        options: {
                            experimentalWatchApi: true,
                            transpileOnly: true,
                        },
                    },
                ],
            },
            {
                test: /\.html$/,
                loader: 'file-loader',
                options: {
                    name(file: string) {
                        return file;
                    },
                } as Options,
            },
        ],
    },
    plugins: [
        new ForkTsCechkerWebpackPlugin({
            async: true,
        }),
    ],
    externals: {
        vscode: 'commonjs vscode',
    },
    target: 'node',
    resolve: {
        extensions: ['.ts', '.js', '.json'],
        alias: {
            vscode: path.join(root, 'node_modules/@types/vscode'),
        },
    },
    stats: {
        all: false,
        colors: true,
    },
};

const compiler = webpack(config, (err, stats) => {
    if (err) throw err;
    console.log(
        stats.toString({
            all: false,
            colors: true,
            children: false,
        })
    );
});
