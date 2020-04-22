function observer(observed, fn, updateImmediately) {
    return observed['addObserver'](fn, updateImmediately);
}

module.exports = observer;
