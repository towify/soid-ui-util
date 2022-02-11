/*
 * @Author: allen
 * @Date: 2022/2/9
 */

import { RectInfo } from '../../type/common.type';

export class RectUtils {
  static getMaxRect(rect: RectInfo, compareRect: RectInfo): RectInfo {
    const rectX = rect.x < compareRect.x ? rect.x : compareRect.x;
    const rectY = rect.y < compareRect.y ? rect.y : compareRect.y;
    return {
      x: rectX,
      y: rectY,
      width:
        rect.x + rect.width > compareRect.x + compareRect.width
          ? rect.x + rect.width - rectX
          : compareRect.x + compareRect.width - rectX,
      height:
        rect.y + rect.height > compareRect.y + compareRect.height
          ? rect.y + rect.height - rectY
          : compareRect.y + compareRect.height - rectY
    };
  }

  public static getMaxRangeRect(rectList: RectInfo[]): RectInfo {
    if (!rectList.length)
      return {
        x: 0,
        y: 0,
        width: 0,
        height: 0
      };
    const rootMaxRect = JSON.parse(JSON.stringify(rectList[0]));
    rectList.forEach(rect => {
      if (rect.x < rootMaxRect.x) {
        rootMaxRect.width += rootMaxRect.x - rect.x;
        rootMaxRect.x = rect.x;
      }
      if (rect.y < rootMaxRect.y) {
        rootMaxRect.height += rootMaxRect.y - rect.y;
        rootMaxRect.y = rect.y;
      }
      if (rect.x + rect.width > rootMaxRect.x + rootMaxRect.width) {
        rootMaxRect.width = rect.x + rect.width - rootMaxRect.x;
      }
      if (rect.y + rect.height > rootMaxRect.y + rootMaxRect.height) {
        rootMaxRect.height = rect.y + rect.height - rootMaxRect.y;
      }
    });
    return rootMaxRect;
  }

  public static containsRect(rect: RectInfo, containsRect: RectInfo): boolean {
    return (
      rect.x <= containsRect.x &&
      rect.y <= containsRect.y &&
      rect.x + rect.width >= containsRect.x + containsRect.width &&
      rect.y + rect.height >= containsRect.y + containsRect.height
    );
  }

  public static containersPoint(rect: RectInfo, point: { x: number; y: number }): boolean {
    return (
      rect.x <= point.x &&
      rect.y <= point.y &&
      rect.x + rect.width >= point.x &&
      rect.y + rect.height >= point.y
    );
  }

  public static crossRect(rect: RectInfo, crossRect: RectInfo): boolean {
    return (
      Math.max(rect.x, crossRect.x) <=
        Math.min(rect.x + rect.width, crossRect.x + crossRect.width) &&
      Math.max(rect.y, crossRect.y) <=
        Math.min(rect.y + rect.height, crossRect.y + crossRect.height)
    );
  }

  public static crossRectDirection(rect: RectInfo, crossRect: RectInfo, isHorizontal = true) {
    let position: 'x' | 'y' = 'x';
    let size: 'width' | 'height' = 'width';
    if (!isHorizontal) {
      position = 'y';
      size = 'height';
    }
    return (
      Math.max(rect[position], crossRect[position]) <=
      Math.min(rect[position] + rect[size], crossRect[position] + crossRect[size])
    );
  }

  public static getRotationRect(rect: RectInfo, rotated: number) {
    const rotatedValue = (rotated * Math.PI) / 180;
    const sinValue = Math.abs(Math.sin(rotatedValue));
    const cosValue = Math.abs(Math.cos(rotatedValue));
    const rectWidth = rect.width * cosValue + rect.height * sinValue;
    const rectHeight = rect.width * sinValue + rect.height * cosValue;
    return {
      width: rectWidth,
      height: rectHeight,
      x: rect.x + rect.width / 2 - rectWidth / 2,
      y: rect.y + rect.height / 2 - rectHeight / 2
    };
  }
}
