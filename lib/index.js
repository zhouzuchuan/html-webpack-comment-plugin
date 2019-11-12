import HtmlWebpackPlugin from 'html-webpack-plugin'
import path from 'path'

// 插件名称
const pluginName = 'HtmlWebpackCommentPlugin'

export default class HtmlWebpackCommentPlugin {
    constructor(options) {
        this.options = {
            splitStr: '=',
            suffixStr: '*',
            timesTamp: true,
            template: null,
            ...options,
        }

        const {
            name = '',
            version = '',
            description = '',
            group = '',
            author = '',
            contributors = '',
            ...params
        } = require(path.join(process.cwd(), '/package.json'))

        this.pkg = {
            name,
            version,
            group,
            description,
            author,
            contributors,
            ...params,
        }

        this.splitLine = ''.padStart(60, this.options.splitStr)
    }
    apply(compiler) {
        if (compiler.hooks) {
            // 支持 webpack 4
            compiler.hooks.compilation.tap(pluginName, compilation => {
                if (compilation.hooks.htmlWebpackPluginAlterAssetTags) {
                    // html-webpack-plugin 3
                    compilation.hooks.htmlWebpackPluginAlterAssetTags.tapAsync(
                        pluginName,
                        (data, cb) => {
                            data.html = this.createComment(data.html)
                            return cb(null, data)
                        },
                    )
                } else if (HtmlWebpackPlugin && HtmlWebpackPlugin.getHooks) {
                    // html-webpack-plugin 4
                    HtmlWebpackPlugin.getHooks(compilation).beforeEmit.tapAsync(
                        pluginName,
                        (data, cb) => {
                            data.html = this.createComment(data.html)
                            cb(null, data)
                        },
                    )
                } else {
                    throw new Error('Cannot find appropriate compilation hook')
                }
            })
        } else {
            compiler.plugin('compilation', function(compilation) {
                compilation.plugin(
                    'html-webpack-plugin-alter-asset-tags',
                    (htmlPluginData, callback) => {
                        htmlPluginData.html = this.createComment(
                            htmlPluginData.html,
                        )
                        return callback(null, htmlPluginData)
                    },
                )
            })
        }
    }

    /**
     *
     * 添加整体注释至指定字符串
     *
     * @param {*} str
     * @returns
     * @memberof HtmlWebpackCommentPlugin
     */
    createComment(str) {
        return ['<!--', ...this.createTemplate(), '-->'].join('\n') + str
    }

    /**
     *
     * 创建模板
     *
     * @returns
     * @memberof HtmlWebpackCommentPlugin
     */
    createTemplate() {
        const { template, timesTamp } = this.options

        if (template !== null) {
            return this.spliceArray(
                typeof template === 'function' ? template(this.pkg) : template,
            )
        } else {
            // 使用默认模板
            const {
                name,
                version,
                group,
                description,
                author,
                contributors,
            } = this.pkg

            return [
                '',
                this.splitLine,
                this.assemblyText(`${name} - v${version}`),
                this.splitLine,
                '',
                this.assemblyText(description),

                '',
                this.assemblyText(
                    group
                        ? `Copyright © ${new Date().getFullYear()} ${group}`
                        : '',
                ),

                '',
                this.splitLine,
                ...this.assemblyProgrammerText(author, 'Create By'),
                ...this.assemblyProgrammerText(contributors, 'Code By'),

                ...(timesTamp
                    ? ['', this.assemblyText(`Build on ${new Date()}`)]
                    : []),
                '',
            ]
        }
    }
    /**
     *
     * 文字添加前缀
     *
     * @param {*} text
     * @returns
     * @memberof HtmlWebpackCommentPlugin
     */
    assemblyText(text) {
        return text ? `${this.options.suffixStr} ${text}` : ''
    }

    /**
     *
     * 将数据统一拼接成数组 (方便处理)
     *
     * @param {*} data
     * @returns
     * @memberof HtmlWebpackCommentPlugin
     */
    spliceArray(data) {
        return Array.isArray(data) ? data : [data]
    }
    /**
     *
     * 拼接 码农信息（作者、维护者）
     *
     * @param {*} data
     * @returns
     * @memberof HtmlWebpackCommentPlugin
     */
    spliceProgrammer(data) {
        if (typeof data === 'object' && !Array.isArray(data) && data !== null) {
            const { name = '', email = '', url = '' } = data
            return `${name}${email ? `(${email})` : ''}${
                url ? ` [${url}]` : ''
            }`
        } else {
            return data
        }
    }

    /**
     *
     * 处理多个 【拼接 码农信息（作者、维护者）】
     *
     * @param {*} data
     * @param {string} [str='']
     * @returns
     * @memberof HtmlWebpackCommentPlugin
     */
    assemblyProgrammerText(data, str = '') {
        const dealArr = this.spliceArray(data)
            .map((v, i) => {
                const programmerStr = this.spliceProgrammer(v)
                return this.assemblyText(
                    programmerStr
                        ? `${
                              i > 0 ? ''.padStart(str.length, ' ') : str
                          } ${programmerStr}`
                        : '',
                )
            })
            .filter(v => Boolean(v))

        return dealArr.length ? ['', ...dealArr] : []
    }
}
