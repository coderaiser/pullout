import fs from 'node:fs';
import {Readable} from 'node:stream';
import {fileURLToPath} from 'node:url';
import {dirname} from 'node:path';
import {test} from 'supertape';
import {tryToCatch} from 'try-to-catch';
import {pullout} from '../lib/pullout.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

test('pullout: args: no', async (t) => {
    const [e] = await tryToCatch(pullout);
    
    t.equal(e.message, 'stream should be an object!', 'should throw when no args');
    t.end();
});

test('pullout: args: wrong type', async (t) => {
    const [e] = await tryToCatch(pullout, fs.createReadStream(__filename), 'hello');
    
    t.equal(e.message, 'type could be string or buffer only!', 'should throw when wrong type');
    t.end();
});

test('pullout: no type', async (t) => {
    const read = fs.createReadStream(__filename);
    const data = await pullout(read, 'buffer');
    const file = fs.readFileSync(__filename);
    
    t.ok(file.equals(data), 'data should be equal');
    t.end();
});

test('pullout: type: string', async (t) => {
    const read = fs.createReadStream(__filename);
    
    const data = await pullout(read);
    const file = fs.readFileSync(__filename, 'utf8');
    
    t.equal(data, file, 'data should be equal');
    t.end();
});

test('pullout: type: string: empty', async (t) => {
    const name = `${__dirname}/fixture/empty`;
    const read = fs.createReadStream(name);
    const data = await pullout(read);
    
    t.equal(data, '', 'should return empty string');
    t.end();
});

test('pullout: type: buffer', async (t) => {
    const read = fs.createReadStream(__filename);
    const data = await pullout(read, 'buffer');
    const file = fs.readFileSync(__filename);
    
    t.deepEqual(data, file, 'data should be equal');
    t.end();
});

test('pullout: error', async (t) => {
    const random = Math.random();
    const read = fs.createReadStream(String(random));
    
    const [e] = await tryToCatch(pullout, read);
    
    t.ok(e, 'read error: ' + e.message);
    t.end();
});

test('pullout: type: string: multibyte char split between chunks', async (t) => {
    const buffer = Buffer.from('я');
    const stream = Readable.from([
        buffer.subarray(0, 1),
        buffer.subarray(1),
    ]);
    
    const data = await pullout(stream);
    
    t.equal(data, 'я', 'should not break multibyte char');
    t.end();
});

test('pullout: type: string: emoji split between chunks', async (t) => {
    const buffer = Buffer.from('a😀b');
    const stream = Readable.from([
        buffer.subarray(0, 3),
        buffer.subarray(3, 5),
        buffer.subarray(5),
    ]);
    
    const data = await pullout(stream);
    
    t.equal(data, 'a😀b', 'should not break emoji');
    t.end();
});

test('pullout: type: string: string chunks', async (t) => {
    const stream = Readable.from(['hello', ' ', 'я']);
    
    const data = await pullout(stream);
    
    t.equal(data, 'hello я', 'should join string chunks');
    t.end();
});

test('pullout: type: string: stream with encoding', async (t) => {
    const buffer = Buffer.from('я');
    const stream = Readable.from([
        buffer.subarray(0, 1),
        buffer.subarray(1),
    ], {
        objectMode: false,
    });
    
    stream.setEncoding('utf8');
    
    const data = await pullout(stream);
    
    t.equal(data, 'я', 'should work with setEncoding');
    t.end();
});
