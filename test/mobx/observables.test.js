"use strict";

const o = require("../../dist/index.common");
const observable = o.observable;
const extendObservable = o.extendObservable;
const observer = require("./observer");

const voidObserver = function() {};

function buffer() {
    const b = [];
    const res = function(x) {
        if (typeof x === "object") {
            const copy = { ...x.value };
            b.push(copy);
        } else {
            b.push(x);
        }
    };
    res.toArray = function() {
        return b;
    };
    return res;
}

test("argumentless observable", () => {
    const a = observable();

    expect(a.get()).toBe(undefined);
});

test("basic", function() {
    const x = observable(3);
    const b = buffer();
    observer(x, b, false);
    expect(3).toBe(x.get());

    x.set(5);
    expect(5).toBe(x.get());
    expect([5]).toEqual(b.toArray());
});

test("#558 boxed observables stay boxed observables", function() {
    const a = observable({
        x: observable(3)
    });

    expect(typeof a.getModel().x).toBe("object");
    expect(typeof a.getModel().x.get).toBe("function");
});

test("Issue 1092 - We should be able to define observable on all siblings", () => {
    expect.assertions(1);

    // The parent is an observable
    const parent = observable({});
    extendObservable(parent, {});

    // Child1 "inherit" from the parent
    // and has an observable attribute
    const child1 = observable(Object.create(parent));
    extendObservable(child1, {
        attribute: 7
    });

    // Child2 also "inherit" from the parent
    // But does not have any observable attribute
    const child2 = observable(Object.create(parent));
    expect(() => {
        extendObservable(child2, {
            attribute: 8
        });
    }).not.toThrow()
});

test("can make non-extenible objects observable", () => {
    const base = { x: 3 };
    Object.freeze(base);
    const o = observable(base);
    o.x = 4;
    expect(o.x).toBe(4);
});
