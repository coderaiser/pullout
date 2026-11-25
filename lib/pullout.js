import {Buffer} from 'node:buffer';

export const pullout = async (stream, type = 'string') => {
    check(stream, type);
    
    const isStr = type === 'string';
    const array = [];
    
    for await (const chunk of stream)
        array.push(chunk);
    
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

function check(stream, type) {
    if (typeof stream !== 'object')
        throw Error('stream should be an object!');
    
    if (!/string|buffer/.test(type))
        throw Error('type could be string or buffer only!');
}
