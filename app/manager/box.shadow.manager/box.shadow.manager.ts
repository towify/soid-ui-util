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
    if (!this.#spinButtonPosition || !this.#rect) return this;
    const distance = this.#distance ?? this.#radius!;
    // 比例值: 根据传入的distance，要等比例控制 horizontalOffset 和 verticalOffset 的缩放
    const scale = distance / this.#radius!;
    const horizontalOffset = this.#spinButtonPosition.x * scale;
    const verticalOffset = this.#spinButtonPosition.y * scale;
    const resultAngle = BoxShadowManager.getAngle(
      this.#spinButtonPosition.x,
      this.#spinButtonPosition.y
    );
    const parameter = {
      angle: resultAngle,
      horizontalOffset: parseFloat(horizontalOffset.toFixed(2)),
      verticalOffset: parseFloat(verticalOffset.toFixed(2))
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
    const distance =
      (Math.sqrt(horizontal ** 2 + vertical ** 2) * this.#radius) / radiusMin;
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
      positionX,
      positionY,
      distance: parseFloat(distance.toFixed(2))
    };
  }

  private static getAngle(horizontal: number, vertical: number): number {
    const cosValue = horizontal / Math.sqrt(horizontal ** 2 + vertical ** 2);
    let currentAngle = (Math.acos(cosValue) * 180) / Math.PI;
    if (vertical > 0) {
      currentAngle = 360 - currentAngle;
    }
    return parseFloat(currentAngle.toFixed(2));
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
    const horizontal =
      (distance * Math.cos((angle * Math.PI) / 180) * radiusMin) / this.#radius;
    const vertical =
      (-distance * Math.sin((angle * Math.PI) / 180) * radiusMin) /
      this.#radius;
    const positionX =
      this.#radius -
      this.#pointRadius +
      radiusMin * Math.cos((angle * Math.PI) / 180);
    const positionY =
      this.#radius -
      this.#pointRadius -
      radiusMin * Math.sin((angle * Math.PI) / 180);
    return {
      horizontal: parseFloat(horizontal.toFixed(2)),
      vertical: parseFloat(vertical.toFixed(2)),
      positionX,
      positionY
    };
  }
}
