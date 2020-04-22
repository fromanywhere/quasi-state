"use strict";

const o = require("../../dist/index.common");
const observable = o.observable;
const extendObservable = o.extendObservable;
const toJS = o.toJS;
const observer = require("./observer");

test("toJS handles dates", () => {
    const a = observable({
        d: new Date()
    });

    const b = toJS(a);
    expect(b.d instanceof Date).toBe(true);
    expect(a.d === b.d).toBe(true);
});

test("verify #566 solution", () => {
    function MyClass() {}
    const a = new MyClass();
    const b = observable({ x: 3 });
    const c = observable({ a: a, b: b })

    expect(toJS(c).a === a).toBeTruthy(); // true
    expect(toJS(c).b !== b).toBeTruthy(); // false, cloned
    expect(toJS(c).b.x === b.x).toBeTruthy(); // true, both 3
});

describe("recurseEverything set to true", function() {
    test("prototype chain will be removed even if the object is not observable", function() {
        function Person() {
            this.firstname = "michel";
            this.lastname = "weststrate";
        }
        const p = new Person();

        expect(toJS(p)).toBeInstanceOf(Person);
        expect(toJS(p)).toEqual({ firstname: "michel", lastname: "weststrate" });
    });

    test("Date type should not be converted", function() {
        const date = new Date();
        expect(toJS(observable(date), { recurseEverything: true })).toBe(date)
    });

    describe("observable array", function() {
        test("observable array should be converted to a plain array", function() {
            const arr = [1, 2, 3];
            expect(toJS(observable(arr), { recurseEverything: true })).toEqual(arr)
            expect(toJS(arr, { recurseEverything: true })).toEqual(arr)
        });

        test("observable array inside an array will be converted with recurseEverything flag", function() {
            const obj = { arr: observable([1, 2, 3]) };
            expect(toJS(obj, { recurseEverything: true }).arr).toEqual([1, 2, 3])
        })
    });

    test("should return null if source is null", function() {
        expect(toJS(null)).toBeNull();
        expect(toJS(null, { recurseEverything: true })).toBeNull()
    })
});
