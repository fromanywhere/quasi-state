import observableModel from "./ObservableModel";
import patchObservablePrototype from "./ObservablePrototype";
import patchObservableObjectPrototype from "./ObservableObjectPrototype";
import toJS from "../toJS";

const ALLOCATE_FACTOR = 100;
const INPLACE_METHODS = ['splice', 'pop', 'shift', 'unshift'];

function defineArrayModel() {
    Object.defineProperty(this, 'length', {
        get() {
            this._commitTransaction();
            return this.quasi$model.length;
        },
        set(value) {
            this._commitTransaction();
            this.quasi$model.length = value;
        }
    });

    Object.defineProperty(this, "quasi$allocatedAccessors", {
        // Будет увеличиваться по мере наполнения массива
        'writable': true,
        'value': 0
    });

    Object.defineProperty(this, "quasi$previousLength", {
        // Отражает количество enumerables accessors
        'writable': true,
        'value': -1
    });
}

function patchInplaceMethods() {
    INPLACE_METHODS.forEach(function(method) {
        ObservableArray.prototype[method] = function(...args) {
            this._commitTransaction();
            const result = Array.prototype[method].apply(this.quasi$model, args);
            this._defineAccessors();
            this.notifyObservers();
            return toJS(result);
        };
    });
}

export default function ObservableArray(model) {
    observableModel.call(this, [].concat(model));
    defineArrayModel.call(this);
    this._defineAccessors();
}

ObservableArray.prototype = Object.create(Array.prototype);
ObservableArray.prototype.constructor = ObservableArray;

patchObservablePrototype(ObservableArray);
patchObservableObjectPrototype(ObservableArray);
patchInplaceMethods();

ObservableArray.prototype.concat = function(...arrays) {
    this._commitTransaction();
    let jsArray = this.slice();
    for (let i = 0; i < arrays.length; i++) {
        jsArray = jsArray.concat(arrays[i].slice());
    }
    return new ObservableArray(jsArray);
};

ObservableArray.prototype._defineAccessors = function() {
    const arrayLength = this.length;

    // Переопределить все уже существующие акцессоры
    for (let i = 0; i < this.quasi$allocatedAccessors; i++) {
        this._createAccessor(i, i < arrayLength);
    }

    // Так добавилось, что акцессоров не хватает
    if ((this.quasi$allocatedAccessors - arrayLength) < (ALLOCATE_FACTOR / 2)) {
        const currentMax = Math.max(arrayLength, this.quasi$allocatedAccessors);
        const count = currentMax + ALLOCATE_FACTOR;
        for (let i = this.quasi$allocatedAccessors; i < count; i++) {
            this._createAccessor(i, i < arrayLength);
        }
        this.quasi$allocatedAccessors = count;
    }

    this.quasi$previousLength = arrayLength;
};
