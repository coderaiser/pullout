import {Buffer} from 'node:buffer';

export const pullout = async (stream, type = 'string', {limit} = {}) => {
    check(stream, type, limit);
    
    const isStr = type === 'string';
    const array = [];
    let size = 0;
    
    const hasLimit = !isUndefined(limit);
    
    for await (const chunk of iterate(stream, hasLimit)) {
        if (hasLimit) {
            size += byteLength(chunk);
            
            if (size > limit)
                throw createLimitError(limit);
        }
        
        array.push(chunk);
    }
    
    if (!isStr)
        return Buffer.concat(array);
    
    if (array.every(isString))
        return array.join('');
    
    return Buffer
        .concat(array.map(toBuffer))
        .toString();
};

const isString = (a) => typeof a === 'string';
const toBuffer = (a) => isString(a) ? Buffer.from(a) : a;
const isUndefined = (a) => typeof a === 'undefined';
const byteLength = (a) => isString(a) ? Buffer.byteLength(a) : a.length;

const iterate = (stream, hasLimit) => {
    if (!hasLimit || !stream.iterator)
        return stream;
    
    return stream.iterator({
        destroyOnReturn: false,
    });
};

function createLimitError(limit) {
    const error = Error(`stream is larger than ${limit} bytes!`);
    
    error.code = 'ELIMIT';
    
    return error;
}

function check(stream, type, limit) {
    if (typeof stream !== 'object')
        throw Error('stream should be an object!');
    
    if (!/string|buffer/.test(type))
        throw Error('type could be string or buffer only!');
    
    if (!isUndefined(limit) && !(Number.isFinite(limit) && limit >= 0))
        throw Error('limit should be a positive number!');
}
