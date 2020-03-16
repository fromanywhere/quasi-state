import ObservableBox from "./ObservableTypes/ObservableBox";
import ObservableObject from "./ObservableTypes/ObservableObject";
import ObservableArray from "./ObservableTypes/ObservableArray";

let _id = 0;

export function getUniqueId() {
    _id = (_id + 1) % Number.MAX_VALUE;
    return _id;
}

export function isObject(data) {
    return (typeof data === 'object') && (data !== null);
}

export function isObservable(data) {
    return data instanceof ObservableBox || data instanceof ObservableObject || data instanceof ObservableArray;
}

export function getValue(data) {
    if (!data || !data.get) {
        return data;
    }

    return data.get();
}

export const EMPTY = 'quasi$empty';
export const RESET = 'quasi$reset';
export const DEBUG = 'quasi$debug';

export const HIDE_FORCE_COMMIT_CHECK = '1';
export const HIDE_FREQUENCY_CHECK = '2';
