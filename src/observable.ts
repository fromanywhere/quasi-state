import ObservableArray from "./ObservableTypes/ObservableArray";
import {isObject, isObservable} from "./Utils";
import ObservableObject from "./ObservableTypes/ObservableObject";
import ObservableBox from "./ObservableTypes/ObservableBox";

function observableFactory(data) {
    if (Array.isArray(data)) {
        return new ObservableArray(data);
    }
    if (isObject(data)) {
        return new ObservableObject(data);
    }
    return new ObservableBox(data);
}

function deepWalk(originalData, referenceData, deep = true) {
    if (isObservable(originalData)) {
        return originalData;
    }

    if (isObject(originalData)) {
        const proto = Object.getPrototypeOf(originalData);
        if (proto !== Object.prototype && proto !== Array.prototype) {
            return originalData;
        }
    }

    const copy = makeCopy(originalData);

    if (isObject(copy)) {
        for (let key in copy) {
            if (copy.hasOwnProperty(key)) {
                copy[key] = deepWalk(copy[key], referenceData, deep);
            }
        }
    }
    return (deep || originalData === referenceData)
        ? observableFactory(copy)
        : copy;
}

function makeCopy(data) {
    if (Array.isArray(data)) {
        return [].concat(data);
    }

    if (isObject(data)) {
        return {...data};
    }

    return data;
}

export default function observable(data: any, deep?: boolean) {
    return deepWalk(data, data, deep);
}
