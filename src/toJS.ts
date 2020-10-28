import ObservableArray from "./ObservableTypes/ObservableArray";
import ObservableObject from "./ObservableTypes/ObservableObject";
import {getValue, isObject, isObservable} from "./utils";

function extractObservable(data) {
    if (!isObservable(data)) {
        return data;
    }

    let result;
    const model = getValue(data);

    if (data instanceof ObservableArray) {
        result = [];
        for (let i = 0; i < model.length; i++) {
            result.push(model[i]);
        }
        return result;
    }

    if (data instanceof ObservableObject) {
        result = {};
        for (let key in model) {
            if (model.hasOwnProperty(key)) {
                result[key] = model[key];
            }
        }
        return result;
    }

    return model;
}

export default function toJS(data: any) {
    let copy = extractObservable(data);

    if (isObject(copy)) {
        for (let key in copy) {
            if (copy.hasOwnProperty(key)) {
                copy[key] = toJS(copy[key]);
            }
        }
    }

    return copy;
}
