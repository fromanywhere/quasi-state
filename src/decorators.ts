import {DEBUG, getValue, isObservable} from "./Utils";
import observable from "./observable";
import {Env} from "./env";
import {AbstractWatcher} from "./AppAdapters/AbstractWatcher";
import {AbstractStore} from "./AppAdapters/AbstractStore";
import {IAbstractWatcher} from "./types";

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

export function watch<C extends AbstractWatcher<any>>(accessor: (component: C) => any) {
    return function(component: {}, fieldName: string) {
        let func: () => void;
        Object.defineProperty(component, fieldName, {
            get() {
                return func;
            },
            set(this: IAbstractWatcher<any>, value) {
                if (Env.DEVMODE && !(this instanceof AbstractWatcher)) {
                    throw new Error(`Class ${this.constructor.name} should be inherited from AbstractWatcher`);
                }

                func = this.loggerWrapper(value);

                const observableField = this['store']['getModel'](accessor.bind(null, this));
                const unsub = observableField['addObserver'](func, false);
                this.registerObserver(unsub);
            }
        });
    };
}
