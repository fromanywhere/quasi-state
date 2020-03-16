import observableModel from "./ObservableModel";
import patchObservablePrototype from "./ObservablePrototype";

export default function ObservableBox(model) {
    observableModel.call(this, model);
}

patchObservablePrototype(ObservableBox);

ObservableBox.prototype.get = function() {
    return this.getModel();
};

ObservableBox.prototype.set = function(value, owner = this, key = null) {
    this._putChanges(owner, key, value, this.quasi$model);
};

ObservableBox.prototype.valueOf = function() {
    return this.getModel();
};

ObservableBox.prototype.toString = function() {
    return String(this.getModel());
};
