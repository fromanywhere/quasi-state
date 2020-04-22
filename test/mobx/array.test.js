"use strict";

const o = require("../../dist/index.common");
const observable = o.observable;
const extendObservable = o.extendObservable;
const observer = require("./observer");

test("test1", function() {
    const a = observable([]);
    expect(a.length).toBe(0);
    expect(Object.keys(a)).toEqual([]);
    expect(a.slice()).toEqual([]);

    a.push(1);
    expect(a.length).toBe(1);
    expect(a.slice()).toEqual([1]);

    a[1] = 2;
    expect(a.length).toBe(2);
    expect(a.slice()).toEqual([1, 2]);

    a[1] = 3;
    expect(a.length).toBe(2);
    expect(a.slice()).toEqual([1, 3]);

    a.splice(1, 1, 4, 5);
    expect(a.length).toBe(3);
    expect(a.slice()).toEqual([1, 4, 5]);

    // a.replace([2, 4]);
    a.set([2, 4]);

    a.splice(1, 1);
    expect(a.slice()).toEqual([2]);

    //a.clear();
    a.splice(0, a.length);
    expect(a.slice()).toEqual([]);

    a.length = 4;
    expect(a.length).toEqual(4);

    expect(a.slice()).toEqual([undefined, undefined, undefined, undefined]);

    //a.replace([1, 2, 2, 4]);
    a.set([1, 2, 2, 4]);
    a.length = 4;
    a.length = 2;

    expect(a.slice()).toEqual([1, 2]);

    expect(a.slice().reverse().slice()).toEqual([2, 1]);
    expect(a.slice()).toEqual([1, 2]);

    a.unshift(3);
    expect(a.slice().sort()).toEqual([1, 2, 3]);
    expect(a.slice()).toEqual([3, 1, 2]);

    expect(JSON.stringify(a.slice())).toBe("[3,1,2]");

    expect(a.get(1)).toBe(1);
    a.set(2, 4);
    expect(a.get(2)).toBe(4);

    //	t.deepEqual(Object.keys(a), ['0', '1', '2']); // ideally....
    // expect(Object.keys(a)).toEqual([])
    expect(Object.keys(a)).toStrictEqual(['0', '1', '2']);
});

test("array should support iterall / iterable ", () => {
    const a = observable([1, 2, 3]);

    const values = [];
    a.forEach(v => values.push(v));

    expect(values).toEqual([1, 2, 3]);
});

test("concat should automatically slice observable arrays, #260", () => {
    const a1 = observable([1, 2]);
    const a2 = observable([3, 4]);
    expect(a1.concat(a2).slice()).toEqual([1, 2, 3, 4]);
});

test("observe", function() {
    const ar = observable([1, 4]);

    ar[1] = 3; // 1,3
    ar[2] = 0; // 1, 3, 0
    ar.shift(); // 3, 0
    ar.push(1, 2); // 3, 0, 1, 2
    ar.splice(1, 2, 3, 4); // 3, 3, 4, 2
    expect(ar.slice()).toEqual([3, 3, 4, 2]);

    // ... drop
});

test("array modification1", function() {
    const a = observable([1, 2, 3]);
    const r = a.splice(-10, 5, 4, 5, 6);
    expect(a.slice()).toEqual([4, 5, 6]);
    expect(r).toEqual([1, 2, 3]);
});

test("serialize", function() {
    let a = [1, 2, 3];
    const m = observable(a);

    expect(JSON.stringify(m.slice())).toEqual(JSON.stringify(a));
    expect(a).toEqual(m.slice());

    a = [4];
    m.set(a);
    expect(JSON.stringify(m.slice())).toEqual(JSON.stringify(a));
});

test("array modification functions", function() {
    const ars = [[], [1, 2, 3]];
    const funcs = ["push", "pop", "shift", "unshift"];
    funcs.forEach(function(f) {
        ars.forEach(function(ar) {
            const a = ar.slice();
            const b = observable(a);
            const res1 = a[f](4);
            const res2 = b[f](4);
            expect(res1).toEqual(res2);
            expect(a).toEqual(b.slice());
        })
    })
});

test("is array", function() {
    const x = observable([]);
    expect(x instanceof Array).toBe(true);

    // would be cool if this would return true...
    expect(Array.isArray(x)).toBe(false);
});

test("stringifies same as ecma array", function() {
    const x = observable([]);
    expect(x instanceof Array).toBe(true);

    // would be cool if these two would return true...
    expect(x.toString()).toBe("");
    expect(x.toLocaleString()).toBe("");
    x.push(1, 2);
    expect(x.toString()).toBe("1,2");
    expect(x.toLocaleString()).toBe("1,2");
});

test("peek", function() {
    const x = observable([1, 2, 3]);
    expect(x.slice()).toEqual([1, 2, 3]);
});

test("autoextend buffer length", function() {
    const ar = observable(new Array(1000));
    let changesCount = 0;
    observer(ar, () => ++changesCount, false);

    ar[ar.length] = 0;
    ar.push(0);

    expect(changesCount).toBe(2)
});

test("array exposes correct keys", () => {
    const keys = [];
    const ar = observable([1, 2]);
    for (const key in ar) {
        if (ar.hasOwnProperty(key)) {
            keys.push(key);
        }
    }

    expect(keys).toEqual(['0', '1'])
});

test("can iterate arrays", () => {
    const x = observable([]);
    const y = [];

    const d = observer(x, items => y.push(items.slice()));

    x.push("a");
    x.push("b");
    x.get();
    expect(y).toEqual([[], ["a"], ["a", "b"]]);
    d()
});

test("array is concat spreadable, #1395", () => {
    const x = observable([1, 2, 3, 4]);
    const y = [5].concat(x);
    expect(y.length).toBe(2); // Should become 5 in MobX 5
    expect(y).toEqual([5, x]); // should become [5, 1,2,3,4] in MobX 5
});

test("array is spreadable, #1395", () => {
    const x = observable([1, 2, 3, 4]);
    expect([5, ...x]).toEqual([5, 1, 2, 3, 4]);

    const y = observable([]);
    expect([5, ...y]).toEqual([5]);
});

test("concats correctly #1667", () => {
    const x = observable({ data: [] });

    function generate(count) {
        const d = []
        for (let i = 0; i < count; i++) d.push({});
        return d
    }

    x.data = generate(10000);
    const first = x.data[0];

    x.data = x.data.concat(generate(1000));
    expect(x.data[0]).toBe(first);
    expect(x.data.length).toBe(11000);
});

describe("extended array prototype", () => {
    const extensionKey = "__extension";

    // A single setup/teardown for all tests because we're pretending to do a
    // singular global (dirty) change to the "environment".
    beforeAll(() => {
        Array.prototype[extensionKey] = () => {}
    });
    afterAll(() => {
        delete Array.prototype[extensionKey]
    });

    test("creating an observable should work", () => {
        const a = observable({ b: "b" })
    });

    test("extending an observable should work", () => {
        const a = { b: "b" };
        const c = extendObservable(observable(a), {});
    })
});
