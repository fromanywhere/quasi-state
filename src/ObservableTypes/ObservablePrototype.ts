import {IModelChange, IObserver} from "../types";
import {DEBUG, HIDE_FORCE_COMMIT_CHECK, HIDE_FREQUENCY_CHECK, getValue} from "../utils";
import {Env} from "../env";

const freqIds = {};
function analyzeCallsFrequency(instance, value, changes) {
    const id = instance.quasi$id;
    if (!freqIds[id]) {
        freqIds[id] = [];
        requestAnimationFrame(() => {
            if (freqIds[id].length > 1) {
                const name = (instance[DEBUG] && instance[DEBUG]['name']) || 'anonymous';
                console.info(`${instance['quasi$observers'].length} subscribers of ${name}`, instance, `was notified ${freqIds[id].length} times per requestAnimationFrame with`, freqIds[id]);
            }
            freqIds[id] = null;
        });
    }
    freqIds[id].push(changes || value);
}

export default function patchObservablePrototype(clazz) {

    clazz.prototype['getModel'] = function() {
        this._commitTransaction();
        return this.quasi$model;
    };

    clazz.prototype._processData = function(diff: IModelChange[]) {
        const oldValue = diff[0].oldValue;
        const value = diff[diff.length - 1].value;

        if (oldValue !== value) {
            this.quasi$model = value;
            this.notifyObservers({
                key: null,
                value,
                oldValue
            });

            // Оповестить владельцев
            const authors = {};

            diff.filter((diffBean) => {
                return diffBean.owner && diffBean.key !== null && diffBean.key !== undefined;
            }).forEach((diffBean) => {
                authors[diffBean.owner.quasi$id] = diffBean;
            });

            for (let i in authors) {
                if (authors.hasOwnProperty(i)) {
                    authors[i].owner.notifyObservers([{
                        key: authors[i].key,
                        value,
                        oldValue
                    }]);
                }
            }
        }
    };

    clazz.prototype._commitTransaction = function() {
        if (Env.DEVMODE && (!this[DEBUG] || !this[DEBUG][HIDE_FORCE_COMMIT_CHECK])) {
            if (this.quasi$dataTransaction.commit()) {
                const name = (this[DEBUG] && this[DEBUG]['name']) || 'anonymous';
                console.warn(`Force committed ${name}`, this);
            }
        } else {
            this.quasi$dataTransaction.commit();
        }
    };

    clazz.prototype._putChanges = function(owner, key, value, oldValue) {
        this.quasi$dataTransaction.put({
            owner,
            key,
            value,
            oldValue
        });
    };

    clazz.prototype['addObserver'] = function<T>(observer: IObserver<T>, updateImmediately = true) {
        this.quasi$observers.push(observer);
        if (updateImmediately) {
            observer(getValue(this));
        }
        return this['removeObserver'].bind(this, observer);
    };

    clazz.prototype['removeObserver'] = function<T>(observer: IObserver<T>) {
        const index = this.quasi$observers.indexOf(observer);
        if (index !== -1) {
            this.quasi$observers.splice(index, 1);
        }
    };

    clazz.prototype['removeAllObservers'] = function() {
        this.quasi$observers.length = 0;
    };

    clazz.prototype['notifyObservers'] = function(changes?: IModelChange) {
        if (Env.DEVMODE && (!this[DEBUG] || !this[DEBUG][HIDE_FREQUENCY_CHECK])) {
            analyzeCallsFrequency(this, getValue(this), changes);
        }
        this.quasi$observers.slice().forEach((observer) => {
            observer(getValue(this), changes);
        });
    };
}
