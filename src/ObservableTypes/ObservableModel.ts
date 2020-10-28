import {getUniqueId} from "../utils";
import MicrotaskTransaction from "../Microtask/MicrotaskTransaction";

export default function observableModel(model) {
    Object.defineProperty(this, "quasi$id", {
        'value': getUniqueId()
    });

    Object.defineProperty(this, "quasi$model", {
        // Примитивы могут переписывать модель
        'writable': true,
        'value': model
    });

    Object.defineProperty(this, "quasi$observers", {
        'value': []
    });

    Object.defineProperty(this, "quasi$dataTransaction", {
        'value': new MicrotaskTransaction(this._processData.bind(this))
    });

    Object.defineProperty(this, "quasi$dataTransactionDeps", {
        'value': []
    });
}
