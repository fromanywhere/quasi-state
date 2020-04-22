type IPrimitive = string | number | null | undefined;
export type IConditionalModelChange<T> = T extends IPrimitive ? IModelChange : IModelChange[];

export type IObserver<T> = (observable: T, changes?: IConditionalModelChange<T>) => void;

export interface IHash<V> {
    [key: string]: V
}

export interface IModelChange {
    owner: IObservable<any>,
    key: string | null,
    value: any,
    oldValue: any
}

export interface IObservable<C> {
    quasi$id: number;

    addObserver: <T>(observer: IObserver<T>, updateImmediately?: boolean) => () => void;
    removeObserver: <T>(observer: IObserver<T>) => void;
    removeAllObservers: () => void;
    notifyObservers: (changes?: IConditionalModelChange<C>) => void;
    set: (p1, p2?, p3?) => void;
    get: () => C;
    getModel: () => any;
}

export type IObservableMixin<T> = T & IObservable<T>;

export interface IAbstractStore {
    getModel: <K>(exp: () => K) => IObservableMixin<K>
}

export interface IAbstractWatcher<T> {
    subscriptions: Array<() => void>,
    store: T,

    loggerWrapper: (func: (...params) => void) => (...args) => void,
    errorLogger: (message: Error) => void,
    registerObserver: (unsubscribeFunction: () => void) => void,
    destroy: () => void
}

export const enum IArrayDiffState {
    APPEND = 0,
    PREPEND = 1,
    REPLACE = 2
}
