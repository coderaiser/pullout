'use strict';

const {promisify} = require('util');

module.exports = promisify((stream, type, fn) => {
    if (!fn) {
        fn = type;
        type = 'string';
    }
    
    check(stream, type);
    
    const isStr = type === 'string';
    const onData = isStr ? onStringData : onBufferData;
    
    let string = '';
    
    const array = [];
    
    stream.on('data', onData);
    stream.on('error', onEnd);
    stream.on('end', onEnd);
    
    function onStringData(chunk) {
        string += chunk;
    }
    
    function onBufferData(chunk) {
        array.push(chunk);
    }
    
    function onEnd(error) {
        stream.removeListener('data', onData);
        stream.removeListener('error', onEnd);
        stream.removeListener('end', onEnd);
        
        fn(error, isStr ? string : Buffer.concat(array));
    }
});

function check(stream, type) {
    if (typeof stream !== 'object')
        throw Error('stream should be an object!');
    
    if (!/string|buffer/.test(type))
        throw Error('type could be string or buffer only!');
}

