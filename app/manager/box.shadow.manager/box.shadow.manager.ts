/**
 *  @Author KaySaith
 *  @Date 10/29/20
 */
import { BoxShadowManagerInterface } from './box.shadow.manager.interface';

export class BoxShadowManager implements BoxShadowManagerInterface {
  #rect?: DOMRect;
  #spinButtonPosition?: { x: number; y: number };
  #distance?: number;
  #radius?: number;
  #pointRect?: DOMRect;
  #pointRadius?: number;
  #offsetFix?: number;

  set spinButtonPosition(position: { x: number; y: number }) {
    const positionX = position.x - this.#radius! + this.#pointRadius!;
    const positionY = position.y - this.#radius! + this.#pointRadius!;
    this.#spinButtonPosition = { x: positionX, y: positionY };
  }

  set distance(distance: number) {
    this.#distance = distance;
  }

  set offsetFix(offsetFix: number) {
    this.#offsetFix = offsetFix;
  }

  setSpinPointRect(rect: DOMRect): BoxShadowManager {
    this.#pointRect = rect;
    this.#pointRadius = rect.width / 2;
    return this;
  }

  setSpinButtonRect(rect: DOMRect): BoxShadowManager {
    this.#rect = rect;
    this.#radius = rect.width / 2;
    return this;
  }

  getShadowAngle(
    hold: (result: {
      angle: number;
      horizontalOffset: number;
      verticalOffset: number;
    }) => void
  ): BoxShadowManager {
    if (
      !this.#spinButtonPosition ||
      !this.#rect ||
      this.#distance === undefined
    )
      return this;
    const resultAngle = BoxShadowManager.getAngle(
      this.#spinButtonPosition.x,
      this.#spinButtonPosition.y
    );
    const result = this.getHorizontalAndVerticalAndPositionByAngle(
      resultAngle,
      this.#distance
    );
    const parameter = {
      angle: resultAngle,
      horizontalOffset: result.horizontal,
      verticalOffset: result.vertical
    };
    hold(parameter);
    return this;
  }

  getAngleAndPositionByHorizontalAndVertical(
    horizontal: number,
    vertical: number
  ): {
    angle: number;
    positionX: number;
    positionY: number;
    distance: number;
  } {
    if (!this.#offsetFix) this.#offsetFix = 3;
    if (!this.#pointRadius) this.#pointRadius = 3;
    if (!this.#radius) this.#radius = 16;
    const radiusMin = this.#radius - this.#pointRadius - this.#offsetFix;
    const angle = BoxShadowManager.getAngle(horizontal, vertical);
    const distance = Math.round(Math.sqrt(horizontal ** 2 + vertical ** 2));
    const positionX =
      this.#radius -
      this.#pointRadius +
      radiusMin * Math.cos((angle * Math.PI) / 180);
    const positionY =
      this.#radius -
      this.#pointRadius -
      radiusMin * Math.sin((angle * Math.PI) / 180);

    return {
      angle,
      positionX: parseFloat(positionX.toFixed(2)),
      positionY: parseFloat(positionY.toFixed(2)),
      distance
    };
  }

  private static getAngle(horizontal: number, vertical: number): number {
    if (horizontal === 0 && vertical === 0) {
      return 0;
    }
    const cosValue = horizontal / Math.sqrt(horizontal ** 2 + vertical ** 2);
    let currentAngle = (Math.acos(cosValue) * 180) / Math.PI;
    if (vertical > 0) {
      currentAngle = 360 - currentAngle;
    }
    return Math.round(currentAngle);
  }

  getHorizontalAndVerticalAndPositionByAngle(
    angle: number,
    distance: number
  ): {
    horizontal: number;
    vertical: number;
    positionX: number;
    positionY: number;
  } {
    if (!this.#offsetFix) this.#offsetFix = 3;
    if (!this.#pointRadius) this.#pointRadius = 3;
    if (!this.#radius) this.#radius = 16;
    const radiusMin = this.#radius - this.#pointRadius - this.#offsetFix;
    const horizontal = distance * Math.cos((angle * Math.PI) / 180);
    const vertical = -distance * Math.sin((angle * Math.PI) / 180);
    const positionX =
      this.#radius -
      this.#pointRadius +
      radiusMin * Math.cos((angle * Math.PI) / 180);
    const positionY =
      this.#radius -
      this.#pointRadius -
      radiusMin * Math.sin((angle * Math.PI) / 180);
    return {
      horizontal: parseFloat(horizontal.toFixed(1)),
      vertical: parseFloat(vertical.toFixed(1)),
      positionX: parseFloat(positionX.toFixed(2)),
      positionY: parseFloat(positionY.toFixed(2))
    };
  }
}
