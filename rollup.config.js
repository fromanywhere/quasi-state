import pkg from './package.json';
import cleaner from 'rollup-plugin-cleaner';
import typescript from 'rollup-plugin-typescript2';
import {terser} from "rollup-plugin-terser";
import replace from '@rollup/plugin-replace';
import copy from 'rollup-plugin-copy';
import { sizeSnapshot } from "rollup-plugin-size-snapshot";

export default [{
    input: 'src/index.ts',
    output: [{
        file: pkg.main,
        format: 'amd',
        name: "quasi-state"
    }],
    plugins: [
        cleaner({
            targets: [
                './dist'
            ]
        }),
        replace({
            'Env.DEVMODE': false
        }),
        typescript(),
        terser({
            mangle: {
                properties: {
                    keep_quoted: 'true',
                    reserved: [
                        'observable',
                        'extendObservable',
                        'cutObservable',
                        'toJS',
                        'watched',
                        'watch',
                        'getUniqueId',
                        'getValue',
                        'isObservable',
                        'arrayDiff',
                        'RESET',
                        'DEBUG',
                        'HIDE_FORCE_COMMIT_CHECK',
                        'HIDE_FREQUENCY_CHECK',
                        'AbstractStore',
                        'AbstractWatcher'
                    ]
                }
            },
            output: {
                comments: false
            }
        }),
        copy({
            targets: [{ src: pkg.main, dest: `../build/quasi-state`, rename: 'quasi-state.js' }],
            hook: 'writeBundle'
        }),
        sizeSnapshot()
    ],
    watch: {
        chokidar: true
    }
}, {
    input: 'src/index.ts',
    output: [{
        file: 'dist/index.common.js',
        format: 'commonjs',
        name: "quasi-state"
    }],
    plugins: [
        replace({
            'Env.DEVMODE': false
        }),
        typescript(),
        terser({
            mangle: {
                properties: {
                    keep_quoted: 'true',
                    reserved: [
                        'observable',
                        'extendObservable',
                        'cutObservable',
                        'toJS',
                        'watched',
                        'watch',
                        'getUniqueId',
                        'getValue',
                        'isObservable',
                        'RESET',
                        'DEBUG',
                        'HIDE_FORCE_COMMIT_CHECK',
                        'HIDE_FREQUENCY_CHECK',
                        'AbstractStore',
                        'AbstractWatcher'
                    ]
                }
            },
            output: {
                comments: false
            }
        })
    ]
}];
