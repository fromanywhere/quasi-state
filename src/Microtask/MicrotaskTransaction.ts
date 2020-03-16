import {getUniqueId} from "../utils";

export default class MicrotaskTransaction {
    private _id;
    private _diff;
    private _cb;

    constructor(cb) {
        this._id = null;
        this._diff = [];
        this._cb = cb;
    }

    put(change) {
        if (this._id === null) {
            this._start();
        }
        this._diff.push(change);
        return this;
    }

    commit() {
        if ((this._id !== null) && (this._diff.length)) {
            this._id = null;
            this._cb(this._diff);
            return true;
        }
        return false;
    }

    _start() {
        this._id = getUniqueId();
        this._diff.length = 0;
        Promise.resolve(this._id).then((id) => {
            if (id === this._id) {
                this.commit();
            }
        });
    }
}
