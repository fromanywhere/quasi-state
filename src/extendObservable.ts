import observable from "./observable";

export default function extendObservable(target: any, properties: any, disableBoxing?: boolean) {
    const result = disableBoxing ? target : observable(target);
    for (let key in properties) {
        if (properties.hasOwnProperty(key)) {
            result._createValue(key, properties[key], disableBoxing);
        }
    }
    return result;
}
