'use strict';

const {run} = require('madrun');

module.exports = {
    'test': () => 'tape test/*.js',
    'lint': () => 'putout .',
    'fix:lint': () => run('lint', '--fix'),
    'watch:test': () => run('watcher', '"npm test"'),
    'watcher': () => 'nodemon -w lib -w test -x',
    'coverage': () => 'c8 npm test',
    'report': () => 'c8 report --reporter=text-lcov | coveralls',
};
