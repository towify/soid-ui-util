/**
 *  @Author KaySaith
 *  @Date 10/29/20
 */
import { BoxShadowManagerInterface } from './box.shadow.manager.interface';

export class BoxShadowManager implements BoxShadowManagerInterface {
  #rect?: DOMRect;
  #spinButtonPosition?: { x: number; y: number };
  #distance?: number;

  set spinButtonPosition(position: { x: number; y: number }) {
    this.#spinButtonPosition = position;
  }

  set distance(distance: number) {
    this.#distance = distance;
  }

  setSpinButtonRect(rect: DOMRect): BoxShadowManager {
    this.#rect = rect;
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

    const radius = this.#rect.width / 2;
    // 拖拽判断边界：传入的X、Y大于半径，则不做响应
    if (
      Math.abs(this.#spinButtonPosition.x) > radius ||
      Math.abs(this.#spinButtonPosition.y) > radius
    )
      return this;
    const distance = this.#distance ?? radius;
    // 比例值: 根据传入的distance，要等比例控制 horizontalOffset 和 verticalOffset 的缩放
    const scale = distance / radius;
    const horizontalOffset = this.#spinButtonPosition.x * scale;
    const verticalOffset = this.#spinButtonPosition.y * scale;
    // 原始角度
    const currentAngle =
      (Math.atan(this.#spinButtonPosition.y / this.#spinButtonPosition.x) *
        180) /
      Math.PI;
    let resultAngle = 0;
    // 处理角度返回值：分别处理第一到第四象限的角度（假设已圆心为圆点）
    if (horizontalOffset >= 0 && verticalOffset < 0) {
      resultAngle = -currentAngle;
    } else if (horizontalOffset < 0 && verticalOffset <= 0) {
      resultAngle = 180 - currentAngle;
    } else if (horizontalOffset < 0 && verticalOffset > 0) {
      resultAngle = 180 - currentAngle;
    } else if (horizontalOffset >= 0 && verticalOffset > 0) {
      resultAngle = 360 - currentAngle;
    } else {
      resultAngle = 0;
    }
    const parameter = {
      angle: Math.floor(resultAngle),
      horizontalOffset: Math.floor(horizontalOffset),
      verticalOffset: Math.floor(verticalOffset)
    };
    hold(parameter);

    return this;
  }

  static getAngleByHorizontalAndVertical(
    horizontal: number,
    vertical: number
  ): number {
    // 原始角度
    const currentAngle = (Math.atan(vertical / horizontal) * 180) / Math.PI;
    let resultAngle = 0;
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
}
