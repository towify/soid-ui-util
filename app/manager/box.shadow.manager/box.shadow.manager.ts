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
      horizontalOffset: Math.floor(horizontalOffset),
      verticalOffset: Math.floor(verticalOffset)
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
  } {
    const scale = this.#distance! / this.#radius!;
    const angle = BoxShadowManager.getAngle(horizontal, vertical);
    const positionX = horizontal / scale - this.#pointRadius! + this.#radius!;
    const positionY = vertical / scale - this.#pointRadius! + this.#radius!;
    return {
      angle,
      positionX,
      positionY
    };
  }

  private static getAngle(horizontal: number, vertical: number): number {
    // 原始角度
    const currentAngle = (Math.atan(vertical / horizontal) * 180) / Math.PI;
    let resultAngle: number;
    // 处理角度返回值：分别处理第一到第四象限的角度（假设已圆心为圆点）
    if (horizontal >= 0 && vertical < 0) {
      resultAngle = -currentAngle;
    } else if (horizontal < 0 && vertical <= 0) {
      resultAngle = 180 - currentAngle;
    } else if (horizontal < 0 && vertical > 0) {
      resultAngle = 180 - currentAngle;
    } else if (horizontal >= 0 && vertical > 0) {
      resultAngle = 360 - currentAngle;
    } else {
      resultAngle = 0;
    }
    return Math.floor(resultAngle);
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
    // 弧度转角度 1弧度=180/π度，1度=π/180弧度
    const newAngel = (angle * Math.PI) / 180;
    const sin = Math.sin(newAngel);
    const cos = Math.cos(newAngel);
    let positionX = this.#radius * cos;
    let positionY = -this.#radius * sin;
    if (angle === 0) {
      positionX = this.#radius;
      positionY = 0;
    } else if (angle === 90) {
      positionX = 0;
      positionY = -this.#radius;
    } else if (angle === 180) {
      positionX = -this.#radius;
      positionY = 0;
    } else if (angle === 270) {
      positionX = 0;
      positionY = this.#radius;
    } else if (angle === 360) {
      positionX = this.#radius;
      positionY = 0;
    }
    // 偏移量
    const scale = distance / this.#radius;
    const horizontal =
      ((positionX * (this.#radius - this.#pointRadius - this.#offsetFix)) /
        this.#radius) *
      scale;
    const vertical =
      ((positionY * (this.#radius - this.#pointRadius - this.#offsetFix)) /
        this.#radius) *
      scale;
    // 小红点圆心坐标
    const pointCenterX =
      ((this.#radius - this.#pointRadius - this.#offsetFix) / this.#radius) *
      positionX;
    const pointCenterY =
      ((this.#radius - this.#pointRadius - this.#offsetFix) / this.#radius) *
      positionY;
    // 求出小红点所在正方形的左上角坐标
    const finalPositionX = pointCenterX - this.#pointRadius + this.#radius;
    const finalPositionY = pointCenterY - this.#pointRadius + this.#radius;
    return {
      horizontal: Math.floor(horizontal),
      vertical: Math.floor(vertical),
      positionX: finalPositionX,
      positionY: finalPositionY
    };
  }
}
