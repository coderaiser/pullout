'use strict';

module.exports = async (stream, type = 'string') => {
    check(stream, type);
    
    const isStr = type === 'string';
    const array = [];
    
    for await (const chunk of stream)
        array.push(chunk);
    
    return isStr ? array.join('') : Buffer.concat(array);
};

function check(stream, type) {
    if (typeof stream !== 'object')
        throw Error('stream should be an object!');
    
    if (!/string|buffer/.test(type))
        throw Error('type could be string or buffer only!');
}

