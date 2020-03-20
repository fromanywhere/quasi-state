type IPrimitive = string | number | null | undefined;
export type IConditionalModelChange<T> = T extends IPrimitive ? IModelChange : IModelChange[];

export type IObserver<T> = (observable: T, changes?: IConditionalModelChange<T>) => void;

export interface IModelChange {
    owner: any,
    key: any,
    value: any,
    oldValue: any
}

export interface IObservable<T> {
    addObserver: <T>(observer: IObserver<T>, updateImmediately?: boolean) => () => void;
    removeObserver: <T>(observer: IObserver<T>) => void;
    removeAllObservers: () => void;
    notifyObservers: (changes?: IConditionalModelChange<T>) => void;
    get: () => T
    getModel: () => any;
}

export type IObservableMixin<T> = T & IObservable<T>;
