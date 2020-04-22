import {IAbstractStore, IObservableMixin} from "../types";

export abstract class AbstractStore implements IAbstractStore {
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
