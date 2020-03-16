export type IObserver = (observable, changes?: IModelChange | IModelChange[]) => void;

export interface IModelChange {
    owner: any,
    key: any,
    value: any,
    oldValue: any
}

export interface IObservable {
    addObserver: (observer: IObserver, updateImmediately?: boolean) => () => void;
    removeObserver: (observer: IObserver) => void;
    removeAllObservers: () => void;
    notifyObservers: (changes?) => void;
    getModel: () => any;
}

export type IObservableMixin<K> = K & IObservable;
