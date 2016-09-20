'use strict';
import util from 'nei/lib/util/util';
import subMain from './submain';
import Application from 'nei/lib/util/args';

util.checkNodeVersion();

const options = {
    package: require('nei/package.json'),
    message: require('nei/bin/config.js'),
    build (event) {
        var action = 'build';
        var config = event.options || {};
        config = this.format(action, config);
        config.key = event.options.key;

        if (!config.key) {
            this.log(`错误: 缺少项目的唯一标识 key, 请到 NEI 网站上的相应项目的"工具设置"中查看该 key 值`);
            this.show(action);
        } else {
            subMain.build(this, action, config);
            /**
             * 往外传递
             */
            subMain.on('buildSuccess', (arg0) => {
                this.emit('buildSuccess', arg0);
            });

        }
    },
    update (event) {
        var action = 'update';
        var config = event.options || {};
        config = this.format(action, config);
        subMain.update(this, action, config);
        /**
         * 往外传递
         */
        subMain.on('buildSuccess', (arg0) => {
            this.emit('buildSuccess', arg0);
        });
    }
};

let nei = new Application(options),
    neiTools = {
        build(opt){
            nei.exec( [ 'build -key', opt.key,'-baseDir', opt.baseDir] );
        },
        update (opt) {
            nei.exec([ 'update -baseDir', opt.baseDir ]);
        },
        run (opt) {
            if (opt.hasBuild) {
                /* update */
                this.update({ baseDir: opt.baseDir });
            } else {
                this.build({ key: opt.key, baseDir: opt.baseDir });
            }

            return new Promise((resolve, reject)=> {
                nei.on('buildSuccess', (arg0) => {
                    resolve(arg0);
                });
            });
        }
    };

export default neiTools;
