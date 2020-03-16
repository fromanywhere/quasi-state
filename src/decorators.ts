import {DEBUG, getUniqueId, getValue, isObservable} from "./Utils";
import observable from "./observable";
import {Env} from "./env";

function patchObservableGetter(store, name, params = {}) {
    if (!store['quasi$']) {
        store['quasi$'] = {
            'fields': {},
            'observersToObservables': {},
            'watched': null,

            'watch': function(instance, key, funcName, depsFunc) {
                const func = instance[funcName].bind(instance);

                store['quasi$'].watched = {
                    key,
                    func
                };

                if (!store['quasi$'].observersToObservables[key]) {
                    store['quasi$'].observersToObservables[key] = [];
                }

                // Вызов функции определит, к каким полям обращаемся
                depsFunc(instance);

                store['quasi$'].watched = null;

                if (store['quasi$'].observersToObservables[key].length === 1) {
                    // Обсервер зависит от одного поля.
                    // Можно вызвать функцию прямо с его значением
                    func(store['quasi$'].observersToObservables[key][0]);
                } else {
                    // Полей больше, чем одно, непонятно, какое значение и как передавать
                    // Просто вызов функции
                    func();
                }

                // Вернуть отписку
                return function() {
                    store['quasi$'].observersToObservables[key].forEach(function(observableField) {
                        observableField.removeObserver(func);
                    });
                    store['quasi$'].observersToObservables[key].length = 0;
                };
            }
        };
    }

    Object.defineProperty(store, name, {
        get() {
            const observableValue = store['quasi$'].fields[name];
            const watched = store['quasi$'].watched;

            if (watched) {
                const record = store['quasi$'].observersToObservables[watched.key];

                if (!record.includes(observableValue)) {
                    record.push(observableValue);
                    observableValue.addObserver(watched.func, false);
                }
                return;
            }

            return getValue(observableValue);
        },
        set(value) {
            if (isObservable(store['quasi$'].fields[name])) {
                if (store['quasi$'].watched) {
                    throw new Error();
                }

                if (isObservable(value)) {
                    store['quasi$'].fields[name] = value;
                    return;
                }

                store['quasi$'].fields[name].set(value);
            } else {
                const observableValue = observable(value, true);
                store['quasi$'].fields[name] = observableValue;
                if (Env.DEVMODE) {
                    Object.defineProperty(observableValue, DEBUG, {
                        value: {
                            name: `${name}@${store.constructor.name}`,
                            ...params
                        }
                    });
                }
            }
        }
    });
}

export function watched(arg1, arg2?) {
    const configurableDecoratorHandler = (store, name) => {
        patchObservableGetter(store, name, arg1);
    };

    if (typeof arg2 === 'string') {
        // Это декоратор без параметров
        patchObservableGetter(arg1, arg2);
        return;
    }

    return configurableDecoratorHandler as any;
}

export function watch(watchFunc?) {
    return function(component, fieldName) {
        let func;
        Object.defineProperty(component, fieldName, {
            get() {
                return func;
            },
            set(value) {
                func = value;

                // Здесь патчится прототип наследника ViewComponent
                if (!this['quasi$watched']) {
                    if (Env.DEVMODE && this['quasi$key'] === undefined) {
                        throw new Error("@watcher decorator is missing on class " + this.constructor.name);
                    }

                    this['quasi$watched'] = [];
                }

                this['quasi$watched'].push({
                    fieldName,
                    watchFunc
                });
            }
        });
    };
}

export function watcher(target: any) {
    const original = target;

    const f: any = function(...args) {
        // tslint:disable-next-line:no-this-assignment
        const instance = this;
        const instanceKey = getUniqueId();

        instance['quasi$key'] = instanceKey;
        original.apply(instance, args);

        if (Env.DEVMODE && !instance['store']) {
            throw new Error(`@watcher at ${this.constructor.name} should have "store" property`);
        }

        if (instance['quasi$watched']) {
            instance['quasi$watched'].forEach((watched) => {
                if (Env.DEVMODE && !watched.watchFunc) {
                    throw new Error(`Empty @watch function at ${this.constructor.name} ${watched.fieldName}`);
                }

                if (Env.DEVMODE && !instance['registerObserver']) {
                    throw new Error(`${this.constructor.name} should implement "registerObserver" method`);
                }

                const methodKey = `${watched.fieldName}$${instanceKey}`;
                instance['registerObserver'](instance['store']['quasi$'].watch(instance, methodKey, watched.fieldName, watched.watchFunc));
            });
        } else if (Env.DEVMODE) {
            throw new Error(`@watcher decorator is registered on class ${this.constructor.name} but no @watch found`);
        }

        return instance;
    };

    f.prototype = original.prototype;
    return f;
}
