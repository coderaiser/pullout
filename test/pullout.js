import fs from 'node:fs';
import {Readable} from 'node:stream';
import {fileURLToPath} from 'node:url';
import {dirname} from 'node:path';
import {Buffer} from 'node:buffer';
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

const chunks = (...a) => Readable.from(a.map((b) => Buffer.from(b)));

test('pullout: limit: under', async (t) => {
    const data = await pullout(chunks('hello'), 'string', {
        limit: 10,
    });
    
    t.equal(data, 'hello');
    t.end();
});

test('pullout: limit: exactly', async (t) => {
    const data = await pullout(chunks('hello'), 'string', {
        limit: 5,
    });
    
    t.equal(data, 'hello');
    t.end();
});

test('pullout: limit: buffer: under', async (t) => {
    const data = await pullout(chunks('hello'), 'buffer', {
        limit: 5,
    });
    
    t.deepEqual(data, Buffer.from('hello'));
    t.end();
});

test('pullout: limit: over: message', async (t) => {
    const [e] = await tryToCatch(pullout, chunks('hello!'), 'string', {
        limit: 5,
    });
    
    t.equal(e.message, 'stream is larger than 5 bytes!');
    t.end();
});

test('pullout: limit: over: code', async (t) => {
    const [e] = await tryToCatch(pullout, chunks('hello!'), 'string', {
        limit: 5,
    });
    
    t.equal(e.code, 'ELIMIT');
    t.end();
});

test('pullout: limit: over: buffer', async (t) => {
    const [e] = await tryToCatch(pullout, chunks('hello!'), 'buffer', {
        limit: 5,
    });
    
    t.equal(e.code, 'ELIMIT');
    t.end();
});

test('pullout: limit: over: many small chunks', async (t) => {
    const stream = chunks(...'1234567890'.split(''));
    const [e] = await tryToCatch(pullout, stream, 'string', {
        limit: 5,
    });
    
    t.equal(e.code, 'ELIMIT');
    t.end();
});

test('pullout: limit: over: counts bytes, not chars', async (t) => {
    const [e] = await tryToCatch(pullout, chunks('яяяя'), 'string', {
        limit: 5,
    });
    
    t.equal(e.code, 'ELIMIT');
    t.end();
});

test('pullout: limit: over: string chunks', async (t) => {
    const stream = Readable.from(['яяяя']);
    const [e] = await tryToCatch(pullout, stream, 'string', {
        limit: 5,
    });
    
    t.equal(e.code, 'ELIMIT');
    t.end();
});

test('pullout: limit: over: endless stream', async (t) => {
    let produced = 0;
    
    const stream = new Readable({
        read() {
            produced++;
            this.push(Buffer.from('1234567890'));
        },
    });
    
    await tryToCatch(pullout, stream, 'string', {
        limit: 100,
    });
    
    stream.destroy();
    
    t.ok(produced < 5000, 'should stop reading an endless stream');
    t.end();
});

test('pullout: limit: over: does not destroy stream', async (t) => {
    const stream = chunks('hello!');
    
    await tryToCatch(pullout, stream, 'string', {
        limit: 5,
    });
    
    t.notOk(stream.destroyed, 'should leave stream open to send a response');
    t.end();
});

test('pullout: limit: not a number', async (t) => {
    const [e] = await tryToCatch(pullout, chunks('hello'), 'string', {
        limit: 'big',
    });
    
    t.equal(e.message, 'limit should be a positive number!');
    t.end();
});

test('pullout: limit: negative', async (t) => {
    const [e] = await tryToCatch(pullout, chunks('hello'), 'string', {
        limit: -1,
    });
    
    t.equal(e.message, 'limit should be a positive number!');
    t.end();
});

test('pullout: limit: no limit', async (t) => {
    const data = await pullout(chunks('hello world'), 'string', {});
    
    t.equal(data, 'hello world');
    t.end();
});

test('pullout: limit: numeric string', async (t) => {
    const [e] = await tryToCatch(pullout, chunks('hello'), 'string', {
        limit: '10',
    });
    
    t.equal(e.message, 'limit should be a positive number!');
    t.end();
});

test('pullout: type: string: mixed string and buffer chunks', async (t) => {
    const stream = Readable.from(['hello ', Buffer.from('я'), ' world']);
    
    const data = await pullout(stream);
    
    t.equal(data, 'hello я world');
    t.end();
});
