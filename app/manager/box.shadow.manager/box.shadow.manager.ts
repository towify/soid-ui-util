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

  set spinButtonPosition(position: { x: number; y: number }) {
    const positionX = position.x - this.#radius! + this.#pointRadius!;
    const positionY = position.y - this.#radius! + this.#pointRadius!;
    this.#spinButtonPosition = { x: positionX, y: positionY };
  }

  set distance(distance: number) {
    this.#distance = distance;
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
    // 拖拽判断边界：传入的X、Y大于半径，则不做响应
    if (
      Math.abs(this.#spinButtonPosition.x) > this.#radius! ||
      Math.abs(this.#spinButtonPosition.y) > this.#radius!
    )
      return this;
    const distance = this.#distance ?? this.#radius!;
    // 比例值: 根据传入的distance，要等比例控制 horizontalOffset 和 verticalOffset 的缩放
    const scale = distance / this.#radius!;
    const horizontalOffset = this.#spinButtonPosition.x * scale;
    const verticalOffset = this.#spinButtonPosition.y * scale;
    const resultAngle = this.getAngle(
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

  getAngleByHorizontalAndVertical(
    horizontal: number,
    vertical: number
  ): number {
    const positionX = horizontal;
    const positionY = vertical;
    return this.getAngle(positionX, positionY);
  }

  private getAngle(horizontal: number, vertical: number): number {
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
    // 弧度转角度 1弧度=180/π度，1度=π/180弧度
    const newAngel = (angle * Math.PI) / 180;
    const sin = Math.sin(newAngel);
    const cos = Math.cos(newAngel);
    let positionX = this.#radius! * cos;
    let positionY = this.#radius! * sin;
    if (angle === 0) {
      positionX = this.#radius!;
      positionY = 0;
    } else if (angle === 90) {
      positionX = 0;
      positionY = -this.#radius!;
    } else if (angle === 180) {
      positionX = -this.#radius!;
      positionY = 0;
    } else if (angle === 270) {
      positionX = 0;
      positionY = this.#radius!;
    } else if (angle === 360) {
      positionX = this.#radius!;
      positionY = 0;
    }
    const horizontal = (positionX * distance) / this.#radius!;
    const vertical = (positionY * distance) / this.#radius!;
    positionX = positionX + this.#radius! - this.#pointRadius!;
    positionY = positionY + this.#radius! - this.#pointRadius!;
    return {
      horizontal,
      vertical,
      positionX,
      positionY
    };
  }
}
