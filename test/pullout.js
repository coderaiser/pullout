'use strict';

const fs = require('fs');

const pullout = require('..');
const test = require('tape');

const noop = () => {};

test('pullout: args: no', (t) => {
    t.throws(pullout, /stream could not be empty!/, 'should throw when no args');
    t.end();
});

test('pullout: args: no fn', (t) => {
    const fn = () => pullout(fs.createReadStream(__filename));
    t.throws(fn, /fn could not be empty!/, 'should throw when no args');
    t.end();
});

test('pullout: args: wrong type', (t) => {
    const fn = () => {
        pullout(fs.createReadStream(__filename), 'hello', noop);
    }
    t.throws(fn, /type could be string or buffer only!/, 'should throw when wrong type');
    t.end();
});

test('pullout: no type', (t) => {
    const read = fs.createReadStream(__filename);
    
    pullout(read, (error, data) => {
        const file = fs.readFileSync(__filename);
        
        t.ok(Buffer.compare(file, data), 'data should be equal');
        
        t.end();
    });
});

test('pullout: type: string', (t) => {
    const read = fs.createReadStream(__filename);
    
    pullout(read, 'string', (error, data) => {
        const file = fs.readFileSync(__filename, 'utf8');
        
        t.equal(data, file, 'data should be equal');
        
        t.end();
    });
});

test('pullout: type: buffer', (t) => {
    const read = fs.createReadStream(__filename);
    
    pullout(read, 'buffer', (error, data) => {
        const file = fs.readFileSync(__filename);
        
        t.ok(Buffer.compare(data, file), 'data should be equal');
        
        t.end();
    });
});

test('pullout: error', (t) => {
    const random  = Math.random();
    const read = fs.createReadStream(String(random));
    
    pullout(read, (error) => {
        t.ok(error, 'read error: ' + error.message);
        t.end();
    });
});

