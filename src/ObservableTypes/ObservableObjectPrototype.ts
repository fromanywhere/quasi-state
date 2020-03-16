import observable from "../observable";
import {DEBUG, HIDE_FORCE_COMMIT_CHECK, getValue, isObject, RESET} from "../Utils";
import ObservableArray from "./ObservableArray";
import ObservableBox from "./ObservableBox";
import ObservableObject from "./ObservableObject";
import {Env} from "../Env";

export default function patchObservableObjectPrototype(clazz) {

    clazz.prototype.get = function(key) {
        this._commitTransaction();
        if (key !== undefined) {
            return this[key];
        }
        return this;
    };

    clazz.prototype.set = function(key, value) {
        if (arguments.length === 1) {
            const newValue = observable(key);
            if (newValue.constructor !== this.constructor) {
                // Переопределение типа в рантайме недопустимо
                throw new TypeError();
            }
            this._putChanges(this, RESET, newValue, this);
        } else {
            this._putChanges(this, key, observable(value), this.quasi$model[key]);
        }
    };

    clazz.prototype._createAccessor = function(key, enumerable = true) {
        Object.defineProperty(this, key, {
            // Акцессоры должны уметь быть переопределяемыми и перебираемыми
            'enumerable': enumerable,
            'configurable': true,
            get() {
                this._commitTransaction();

                if (this instanceof ObservableArray && (key >= this.length)) {
                    return undefined;
                }

                return getValue(this.quasi$model[key]);
            },
            set(value) {
                const canBeUpdated = !isObject(value) && this.quasi$model[key] instanceof ObservableBox;
                if (canBeUpdated) {
                    this.quasi$model[key].set(value, this, key);
                    this.quasi$dataTransactionDeps.push(this.quasi$model[key]);
                } else {
                    this._putChanges(this, key, observable(value), this.quasi$model[key]);
                }
            }
        });
    };

    clazz.prototype._commitTransaction = function() {
        this.quasi$dataTransactionDeps.forEach(function(dep) {
            dep.quasi$dataTransaction.commit();
        });
        if (Env.DEVMODE && (!this[DEBUG] || !this[DEBUG][HIDE_FORCE_COMMIT_CHECK])) {
            if (this.quasi$dataTransaction.commit()) {
                const name = (this[DEBUG] && this[DEBUG]['name']) || 'anonymous';
                console.warn(`Force committed ${name}`, this);
            }
        } else {
            this.quasi$dataTransaction.commit();
        }
        this.quasi$dataTransactionDeps.length = 0;
    };

    clazz.prototype._processData = function(diff) {
        const accumulator = {};
        const changes = [];
        let redefineAccessors = false;

        // Схлопнем список изменений в одно по каждому ключу
        for (let i = 0; i < diff.length; i++) {
            const diffBean = diff[i];

            if (!accumulator[diffBean.key]) {
                accumulator[diffBean.key] = diffBean;
            } else {
                accumulator[diffBean.key].value = diffBean.value;
            }
        }

        // Для каждого ключа сверим, произошло ли в конце концов изменение
        for (let key in accumulator) {
            if (accumulator.hasOwnProperty(key)) {
                const keyValue = accumulator[key];
                if (keyValue.value !== keyValue.oldValue) {
                    changes.push(keyValue);

                    if (key === RESET) {
                        // Здесь сущность пересоздана заново.
                        // Если это объект, сначала нужно удалить старые геттеры
                        // Удалить геттер нельзя, можно только переопределить
                        // Переопределяя, нужно не забыть, что в поле могут захотеть снова писать
                        if (this instanceof ObservableObject) {
                            Object.keys(this).forEach((getter) => {
                                Object.defineProperty(this, getter, {
                                    'configurable': true,
                                    get() {
                                        return undefined;
                                    },
                                    set: (val) => {
                                        this._createValue(getter, val, false);
                                    }
                                });
                            });

                            redefineAccessors = true;
                        }

                        this.quasi$model = keyValue.value.getModel();
                    } else {
                        // Если это объект, поля может еще не быть
                        if (!this.quasi$model[key]) {
                            redefineAccessors = true;
                        }

                        this.quasi$model[key] = keyValue.value;
                    }
                }
            }
        }

        redefineAccessors = redefineAccessors || (this instanceof ObservableArray && (this.quasi$previousLength !== this.length));
        if (redefineAccessors) {
            // Какие-то поля изменились
            this._defineAccessors();
        }

        if (changes.length) {
            this.notifyObservers(changes);
        }
    };
}
