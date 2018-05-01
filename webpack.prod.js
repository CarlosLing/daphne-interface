'use strict';

const webpack = require('webpack');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
    mode: 'production',
    devServer: {
        historyApiFallback: true,
        noInfo: false,
        proxy: {
            '/api': {
                target: 'http://localhost:8001/',
                changeOrigin: true,
                ws: true
            },
            '/static': {
                target: 'http://localhost:8001/',
                changeOrigin: true,
                ws: true
            }
        }
    },
});
