var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, privateMap, value) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to set private field on non-instance");
    }
    privateMap.set(receiver, value);
    return value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, privateMap) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return privateMap.get(receiver);
};
var _rect, _spinButtonPosition;
export class BoxShadowManager {
    constructor() {
        _rect.set(this, void 0);
        _spinButtonPosition.set(this, void 0);
    }
    set spinButtonPosition(position) {
        __classPrivateFieldSet(this, _spinButtonPosition, position);
    }
    getShadowAngle(hold) {
        if (__classPrivateFieldGet(this, _spinButtonPosition) && __classPrivateFieldGet(this, _rect)) {
            // do something
        }
        return this;
    }
    setSpinButtonRect(rect) {
        __classPrivateFieldSet(this, _rect, rect);
        return this;
    }
}
_rect = new WeakMap(), _spinButtonPosition = new WeakMap();
