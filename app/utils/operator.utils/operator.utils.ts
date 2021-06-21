/*
 * @author allen
 * @data 2020/12/7 17:58
 */
import { RectInfo, RegionInfo } from '../../type/common.type';

export class OperatorUtils {
  static Gap = 10;

  static checkY(yRange: RegionInfo, rect: RectInfo): boolean {
    return rect.y < yRange.to && rect.y + rect.height > yRange.from;
  }

  static checkX(xRange: RegionInfo, rect: RectInfo): boolean {
    return rect.x < xRange.to && rect.x + rect.width > xRange.from;
  }

  static getRectListInYRange(
    yRange: RegionInfo,
    rectList: RectInfo[]
  ): RectInfo[] {
    return rectList.reduce<RectInfo[]>((previous, current) => {
      if (OperatorUtils.checkY(yRange, current)) {
        return previous.concat(current);
      }
      return previous;
    }, []);
  }

  static getRectListInXRange(
    xRange: RegionInfo,
    rectList: RectInfo[]
  ): RectInfo[] {
    return rectList.reduce<RectInfo[]>((previous, current) => {
      if (OperatorUtils.checkX(xRange, current)) {
        return previous.concat(current);
      }
      return previous;
    }, []);
  }

  static getXRangeInRectList(rectList: RectInfo[]): RegionInfo {
    let from = Number.MIN_VALUE;
    let to = Number.MIN_VALUE;
    rectList.forEach((rect, index) => {
      if (index === 0) {
        from = rect.x;
        to = rect.x + rect.width;
      } else {
        if (rect.x < from) {
          from = rect.x;
        }
        if (rect.x + rect.width > to) {
          to = rect.x + rect.width;
        }
      }
    });
    return {
      from: from !== Number.MIN_VALUE ? from - OperatorUtils.Gap : from,
      to: to !== Number.MIN_VALUE ? to + OperatorUtils.Gap : to
    };
  }

  static getYRangeInRectList(rectList: RectInfo[]): RegionInfo {
    let from = Number.MIN_VALUE;
    let to = Number.MIN_VALUE;
    rectList.forEach((rect, index) => {
      if (index === 0) {
        from = rect.y;
        to = rect.y + rect.height;
      } else {
        if (rect.y < from) {
          from = rect.y;
        }
        if (rect.y + rect.height > to) {
          to = rect.y + rect.height;
        }
      }
    });
    return {
      from: from - OperatorUtils.Gap,
      to: to + OperatorUtils.Gap
    };
  }

  static getRectDistance(rect: RectInfo, parentRect: RectInfo): number {
    let verticalOffset = 0;
    let horizontalOffset = 0;
    let result = 0;
    if (rect.x > parentRect.x + parentRect.width) {
      if (
        Math.abs(rect.y + rect.height - parentRect.y) <
          Math.abs(rect.x - (parentRect.x + parentRect.width)) ||
        Math.abs(rect.y - parentRect.y - parentRect.height) <
          Math.abs(rect.x - (parentRect.x + parentRect.width))
      ) {
        result = rect.x - (parentRect.x + parentRect.width);
      } else if (rect.y < parentRect.y) {
        verticalOffset = parentRect.y - rect.y;
        horizontalOffset = rect.x - parentRect.x - parentRect.width;
      } else {
        verticalOffset =
          rect.y + rect.height - parentRect.y - parentRect.height;
        horizontalOffset = rect.x - parentRect.x - parentRect.width;
      }
    } else if (rect.x < parentRect.x - rect.width) {
      if (
        Math.abs(rect.y + rect.height - parentRect.y) <
          Math.abs(rect.x + rect.width - parentRect.x) ||
        Math.abs(rect.y - parentRect.y - parentRect.height) <
          Math.abs(rect.x + rect.width - parentRect.x)
      ) {
        result = parentRect.x - (rect.x + rect.width);
      } else if (rect.y < parentRect.y) {
        verticalOffset = parentRect.y - rect.y;
        horizontalOffset = parentRect.x - rect.x - rect.width;
      } else {
        verticalOffset =
          rect.y + rect.height - parentRect.y - parentRect.height;
        horizontalOffset = parentRect.x - rect.x - rect.width;
      }
    }
    if (result === 0) {
      if (verticalOffset !== 0 && horizontalOffset !== 0) {
        result = Math.sqrt(verticalOffset ** 2 + horizontalOffset ** 2);
      } else if (parentRect.y > rect.y + rect.height) {
        result = parentRect.y - (rect.y + rect.height);
      } else if (rect.y > parentRect.y + parentRect.height) {
        result = rect.y - (parentRect.y + parentRect.height);
      }
    }
    return Math.round(result);
  }
}
