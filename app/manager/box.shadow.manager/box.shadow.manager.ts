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

  set spinButtonPosition(position: { x: number; y: number }) {
    const positionX = position.x - this.#radius!;
    const positionY = position.y - this.#radius!;
    this.#spinButtonPosition = { x: positionX, y: positionY };
  }

  set distance(distance: number) {
    this.#distance = distance;
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
    const positionX = horizontal - this.#radius!;
    const positionY = vertical - this.#radius!;
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
}
