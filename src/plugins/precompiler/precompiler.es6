/**
 * 预处理器 api，用于
 */
import { resolve, relative } from 'path';
import vinylFs from 'vinyl-fs';
import EventEmitter from 'events';
import {
    util
} from '../../helper';

class PreCompiler extends EventEmitter {
    constructor(options) {
        super();
        Object.assign(this, options);
        /**
         * Vinyl-fs Ignore File Standard
         */
        if (options.ignore) {
            this.ignore = options.ignore.map((item) => {
                return '!' + item;
            });
        }
    }
    pipe(...args) {
        this.source = this.source.pipe.apply(this.source, args);
        args[0].on('returnDependencys', (imports) => {
            this.emit('updateWatch', imports);
        });
        return this;
    }
    run() {
        let workFlow = this.handler(vinylFs.dest.bind(this));
        this.source = vinylFs.src(this.addExludeReg(this.sourcePattern));
        workFlow.forEach((item) => {
            this.pipe(item);
        });
        return this;
    }
    addExludeReg(sourcePattern) {
        if (!this.ignore) {
            return sourcePattern;
        }
        if (Array.isArray(sourcePattern)) {
            return sourcePattern.concat(this.ignore);
        }
        return [sourcePattern].concat(this.ignore);
    }
}
class SinglePreCompiler extends PreCompiler {
    destInstence(sourcePattern) {
        return (dest) => {
            /**
             * @TODO Replace With Glob Standard
             */
            /**
             * 获取输入文件的相对根目录
             * @type {XML|string|void|*}
             */
            let sourceRoot = sourcePattern.replace(/\*+.*$/, '');
            /**
             * 得到输出文件的完整文件名
             */
            let output = resolve(dest, relative(sourceRoot, this.sourcePattern));
            /**
             * 输出文件
             */
            let target = sourceRoot.endsWith('/') ? resolve(output, '..') : output;
            util.log(`${this.sourcePattern} -> ${target}`);
            return vinylFs.dest(target);
        }
    }
    runInstance(sourcePattern) {
        try {
            this.source = vinylFs.src(this.addExludeReg(this.sourcePattern));
            this.handler(this.destInstence.call(this, sourcePattern)).forEach((item) => {
                this.pipe(item);
            });

        } catch (err) {
            console.log(err);
        }
        return this;
    }
}

export { SinglePreCompiler };

export default PreCompiler;

