import observableModel from "./ObservableModel";
import patchObservablePrototype from "./ObservablePrototype";
import patchObservableObjectPrototype from "./ObservableObjectPrototype";
import observable from "../observable";
import {EMPTY} from "../utils";

export default function ObservableObject(model) {
    observableModel.call(this, {...model});
    this._defineAccessors();
}

ObservableObject.prototype.constructor = ObservableObject;

patchObservablePrototype(ObservableObject);
patchObservableObjectPrototype(ObservableObject);

ObservableObject.prototype._defineAccessors = function() {
    for (let key in this.quasi$model) {
        if (this.quasi$model.hasOwnProperty(key)) {
            this._createAccessor(key);
        }
    }
};

ObservableObject.prototype._createValue = function(key, value, disableBoxing) {
    // Установим уникальное старое значение, иначе «изменение» считать будет не от чего
    this._putChanges(
        this,
        key,
        disableBoxing ? value : observable(value),
        EMPTY);
};
