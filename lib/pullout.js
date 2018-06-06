'use strict';

module.exports = (type, stream, fn) => {
    if (!fn) {
        fn = stream;
        stream = type;
        type = 'buffer';
    }
    
    check(type, stream, fn);
    
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
};

function check(type, stream, fn) {
    if (!stream)
        throw Error('stream could not be empty!');
    
    if (!/string|buffer/.test(type))
        throw Error('type could be string or buffer only!');
    
    if (!fn)
        throw Error('fn could not be empty!');
}

