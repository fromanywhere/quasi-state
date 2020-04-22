import {IAbstractWatcher} from "../types";

export abstract class AbstractWatcher<T> implements IAbstractWatcher<T> {
    public 'subscriptions': Array<() => void> = [];
    public 'store': T;

    protected constructor(store: T) {
        this.store = store;
    }

    public 'errorLogger'(message: Error) {
        console.error(message);
    }

    public 'loggerWrapper'(func: (...params) => void) {
        return (...args) => {
            try {
                func(...args);
            } catch (e) {
                this.errorLogger(e);
            }
        }
    }

    public 'registerObserver'(unsubscribeFunction: () => void) {
        this['subscriptions'].push(unsubscribeFunction);
    }

    public 'destroy'() {
        this['subscriptions'].forEach((unsubscribeFunction) => {
            unsubscribeFunction();
        });
        this['subscriptions'].length = 0;
        this.store = null;
    }
}
