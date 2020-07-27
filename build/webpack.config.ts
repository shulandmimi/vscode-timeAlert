import webpack, { Configuration } from 'webpack';
import * as path from 'path';
import { Options } from 'file-loader';
import { Options as TsOptions } from 'ts-loader';
import ForkTsCechkerWebpackPlugin from 'fork-ts-checker-webpack-plugin';

const root = process.cwd();
const mode = process.env.NODE_ENV as Configuration['mode'] || 'development';

console.log('当前环境： ', mode);

const config: Configuration = {
    mode,
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
                        } as TsOptions,
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
            "@": path.join(root, 'src'),
            "@root": path.join(root),
        },
    },
    stats: {
        all: false,
        colors: true,
    },
    watch: mode === 'development',
    devtool: 'inline-source-map',
};

console.log('开始构建');
webpack(config, (err, stats) => {
    if (err) throw err;
    console.log(
        stats.toString({
            all: false,
            colors: true,
            children: false,
        })
    );
    console.log('done');
});
