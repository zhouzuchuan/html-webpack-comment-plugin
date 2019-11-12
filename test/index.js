import { join } from 'path'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import webpack from 'webpack'
// import { expect } from 'chai'
import HtmlWebpackCommentPlugin from '../lib/index.js'

const OUTPUT_DIR = join(__dirname, './test_dist')

const HtmlWebpackPluginOptions = {
    filename: 'index.html',
    hash: false,
    minify: {
        collapseWhitespace: true,
        removeComments: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
    },
    showErrors: true,
    template: join(__dirname, './app.html'),
}

const webpackDevOptions = {
    mode: 'development',
    entry: {
        app: join(__dirname, './app.js'),
    },
    output: {
        path: OUTPUT_DIR,
    },
}

const webpackProdOptions = {
    ...webpackDevOptions,
    output: {
        filename: '[name].[contenthash].min.js',
        path: OUTPUT_DIR,
        pathinfo: true,
    },
    mode: 'production',
}

describe('HtmlWebpackCommentPlugin Development Mode', () => {
    it('should return 200', done => {
        webpack(
            {
                ...webpackDevOptions,
                plugins: [
                    new HtmlWebpackPlugin(HtmlWebpackPluginOptions),
                    new HtmlWebpackCommentPlugin(),
                ],
            },
            err => {
                // expect(!!err).to.be.false
                // const html = getOutput()
                // expect(
                //     /script\s+.*?src\s*=\s*"(\/)?polyfill\.js"/i.test(html),
                //     'could not find polyfill bundle',
                // ).to.be.true
                // expect(
                //     /script\s+.*?src\s*=\s*"(\/)?app\.js"/i.test(html),
                //     'could not find app bundle',
                // ).to.be.true
                done()
            },
        )
    })
})
