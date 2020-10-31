/**
 *  @Author KaySaith
 *  @Date 10/29/20
 */
import {BoxShadowManagerInterface} from "./box.shadow.manager.interface";

export class BoxShadowManager implements BoxShadowManagerInterface {
  #rect?: DOMRect;
  #spinButtonPosition?: { x: number, y: number }

  set spinButtonPosition(position: { x: number, y: number }) {
    this.#spinButtonPosition = position
  }

  getShadowAngle(hold: (angle: number) => void): BoxShadowManager {
    if (this.#spinButtonPosition && this.#rect) {
      // do something
    }
    return this;
  }

  setSpinButtonRect(rect: DOMRect): BoxShadowManager {
    this.#rect = rect;
    return this;
  }
}