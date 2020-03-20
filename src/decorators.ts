import {DEBUG, getValue, isObservable} from "./Utils";
import observable from "./observable";
import {Env} from "./env";
import {IObservableMixin} from "./types";

function patchObservableGetter(store: AbstractStore, name: string, params = {}) {

    Object.defineProperty(store, name, {
        get() {
            const observableValue = this['quasi$'].fields[name];

            if (AbstractStore.prototype['quasi$extr']) {
                AbstractStore.prototype['quasi$extr'] = observableValue;
                return;
            }

            return getValue(observableValue);
        },
        set(value) {
            if (Env.DEVMODE && !(this instanceof AbstractStore)) {
                throw new Error(`Class ${this.constructor.name} should be inherited from AbstractStore`);
            }

            if (isObservable(this['quasi$'].fields[name])) {
                if (isObservable(value)) {
                    this['quasi$'].fields[name] = value;
                    return;
                }

                this['quasi$'].fields[name].set(value);
            } else {
                const observableValue = observable(value, true);
                this['quasi$'].fields[name] = observableValue;
                if (Env.DEVMODE) {
                    Object.defineProperty(observableValue, DEBUG, {
                        configurable: true,
                        value: {
                            name: `${name}@${this.constructor.name}`,
                            ...params
                        }
                    });
                }
            }
        }
    });
}

export function watched(arg1: any, arg2?: any) {
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

export function watch(watchFunc: (component: any) => any) {
    return function(component: {}, fieldName: string) {
        let func: () => void;
        Object.defineProperty(component, fieldName, {
            get() {
                return func;
            },
            set(value) {
                if (Env.DEVMODE && !(this instanceof AbstractWatcher)) {
                    throw new Error(`Class ${this.constructor.name} should be inherited from AbstractWatcher`);
                }

                func = value;
                const observable = this['store']['getModel'](watchFunc.bind(null, this));
                const unsub = observable['addObserver'](func, false);
                this.registerObserver(unsub);
            }
        });
    };
}

export abstract class AbstractWatcher<T> {
    public 'subscriptions': Array<() => void> = [];
    public 'store'!: T;

    protected constructor(store?: T) {
        if (store) {
            // Запись в поле абстрактного предка для view-компонентов
            Object.getPrototypeOf(Object.getPrototypeOf(this))['store'] = store;
        }
    }

    public 'registerObserver'(unsubscribeFunction: () => void) {
        this['subscriptions'].push(unsubscribeFunction);
    }

    public 'destroy'() {
        this['subscriptions'].forEach((unsubscribeFunction) => {
            unsubscribeFunction();
        });
    }
}

export abstract class AbstractStore {
    private 'quasi$extr': any;
    private 'quasi$': {};

    protected constructor() {
        this['quasi$'] = {
            'fields': {}
        };
    }

    public 'getModel'<K>(exp: () => K): IObservableMixin<K> {
        AbstractStore.prototype['quasi$extr'] = true;
        exp();
        const value = AbstractStore.prototype['quasi$extr'];
        AbstractStore.prototype['quasi$extr'] = undefined;
        return value;
    }
}
