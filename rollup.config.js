import pkg from './package.json';
import clean from 'rollup-plugin-clean';
import typescript from 'rollup-plugin-typescript2';
import {terser} from "rollup-plugin-terser";
import replace from '@rollup/plugin-replace';
import copy from 'rollup-plugin-copy';

export default [{
    input: 'src/index.ts',
    output: [{
        file: pkg.main,
        format: 'amd',
        name: "quasi-state"
    }],
    plugins: [
        clean({
            dest: 'dist'
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
            targets: [{ src: pkg.main, dest: '../standalone', rename: 'quasi-state.js' }],
            hook: 'writeBundle'
        })
    ],
    watch: {
        chokidar: true
    }
}];
