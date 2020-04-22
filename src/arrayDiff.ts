import {IArrayDiffState} from "./types";

export default function arrayDiff<K>(from: K[], to: K[], equalKey: string) {
    const oldValue = from.slice();
    const newValue = to.slice();

    if (newValue.length > oldValue.length) {
        if (!oldValue.length) {
            return {
                value: newValue,
                action: IArrayDiffState.APPEND
            };
        }

        if (newValue[0][equalKey] === oldValue[0][equalKey]) {
            const equals = oldValue.every((item, index) => {
                return item[equalKey] === newValue[index][equalKey];
            });

            if (equals) {
                return {
                    value: newValue.slice(oldValue.length),
                    action: IArrayDiffState.APPEND
                };
            }
        }

        if (newValue[newValue.length - 1][equalKey] === oldValue[oldValue.length - 1][equalKey]) {
            const start = newValue.length - oldValue.length;
            const equals = oldValue.every((item, index) => {
                return item[equalKey] === newValue[start + index][equalKey];
            });

            if (equals) {
                return {
                    value: newValue.slice(0, start),
                    action: IArrayDiffState.PREPEND
                };
            }
        }
    }

    return {
        value: newValue,
        action: IArrayDiffState.REPLACE
    };
}
