/*
 * @author allen
 * @data 2020/12/10 13:37
 */

/*
 * @author allen
 * @date 2020/9/29 14:20
 */
import { PointInfo } from '../type/interact.type';

export class RectModel {
  constructor(
    public readonly x: number,
    public readonly y: number,
    public readonly width: number,
    public readonly height: number
  ) {}

  get minLeft(): number {
    return this.x;
  }

  get maxRight(): number {
    return this.x + this.width;
  }

  get center(): PointInfo {
    return {
      x: this.x + this.width / 2,
      y: this.y + this.height / 2
    };
  }

  get minTop(): number {
    return this.y;
  }

  get maxBottom(): number {
    return this.y + this.height;
  }

  contain(point: PointInfo): boolean {
    return (
      point.x >= this.x &&
      point.y >= this.y &&
      point.x <= this.x + this.width &&
      point.y <= this.y + this.height
    );
  }

  containerRect(rect: RectModel): boolean {
    return (
      this.contain({
        x: rect.x,
        y: rect.y
      }) &&
      rect.width <= this.width &&
      rect.height <= this.height
    );
  }

  adjustRect(
    offsetX?: number,
    offsetY?: number,
    offsetWidth?: number,
    offsetHeight?: number
  ): RectModel {
    const newWidth = offsetWidth ? this.width + offsetWidth : this.width;
    const newHeight = offsetHeight ? this.height + offsetHeight : this.height;
    const newX = offsetX ? this.x + offsetX : this.x;
    const newY = offsetY ? this.y + offsetY : this.y;
    return new RectModel(newX, newY, newWidth, newHeight);
  }
}
