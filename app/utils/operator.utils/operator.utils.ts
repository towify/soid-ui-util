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
    if (rect.x > parentRect.x + parentRect.width) {
      if (
        rect.y >= parentRect.y &&
        rect.y <= parentRect.y + parentRect.height - rect.height
      ) {
        return rect.x - (parentRect.x + parentRect.width);
      }
      if (rect.y < parentRect.y) {
        return Math.sqrt(
          (parentRect.y - rect.y) ** 2 +
            (rect.x - (parentRect.x + parentRect.width)) ** 2
        );
      }
      return Math.sqrt(
        (rect.y + rect.height - (parentRect.y + parentRect.height)) ** 2 +
          (rect.x - (parentRect.x + parentRect.width)) ** 2
      );
    }
    if (rect.x < parentRect.x - rect.width) {
      if (
        rect.y >= parentRect.y &&
        rect.y <= parentRect.y + parentRect.height - rect.height
      ) {
        return parentRect.x - (rect.x + rect.width);
      }
      if (rect.y < parentRect.y) {
        return Math.sqrt(
          (parentRect.y - rect.y) ** 2 +
            (parentRect.x - (rect.x + rect.width)) ** 2
        );
      }
      return Math.sqrt(
        (rect.y + rect.height - (parentRect.y + parentRect.height)) ** 2 +
          (parentRect.x - (rect.x + rect.width)) ** 2
      );
    }
    if (parentRect.y > rect.y + rect.height) {
      return parentRect.y - (rect.y + rect.height);
    }
    if (rect.y > parentRect.y + parentRect.height) {
      return rect.y - (parentRect.y + parentRect.height);
    }
    return 0;
  }
}
