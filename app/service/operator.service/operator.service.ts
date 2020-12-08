/*
 * @author allen
 * @data 2020/12/6 16:07
 */
import { Mark } from 'towify-editor-common-values';
import { OperatorServiceInterface } from './operator.service.interface';
import { DefaultRect, RectInfo} from '../../type/common.type';
import { OperatorUtils } from '../../utils/operator.utils/operator.utils';

export class OperatorService implements OperatorServiceInterface {
  private static instance?: OperatorServiceInterface;

  #pageRectList: RectInfo[] = [];

  #parentRect?: RectInfo;

  #size?: { width: number; height: number};

  #gap = 10;

  static getInstance(): OperatorServiceInterface {
    OperatorService.instance ??= new OperatorService();
    return OperatorService.instance;
  }

  set minDistance(value: number) {
    this.#gap = value;
  }

  setPageContainerRects(rectList: RectInfo[]): OperatorServiceInterface {
    this.#pageRectList = rectList;
    return this;
  }

  setParentRect(rect: RectInfo): OperatorServiceInterface {
    this.#parentRect = rect;
    return this;
  }

  setOperatorSize(width: number, height: number): OperatorServiceInterface {
    this.#size = {
      width,
      height
    };
    return this;
  }

  getOperatorRect(): RectInfo {
    const leftRectInfo = this.getLeftMinDistanceRect();
    const rightRectInfo = this.getRightMinDistanceRect();
    const topRectInfo = this.getTopMinDistanceRect();
    const bottomRectInfo = this.getBottomMinDistanceRect();
    if (bottomRectInfo.distance < topRectInfo.distance &&
      bottomRectInfo.distance < rightRectInfo.distance &&
      bottomRectInfo.distance < leftRectInfo.distance) {
      return bottomRectInfo.rect;
    }
    if (topRectInfo.distance < rightRectInfo.distance &&
      topRectInfo.distance < leftRectInfo.distance) {
      return topRectInfo.rect;
    }
    if (leftRectInfo.distance < rightRectInfo.distance) {
      return leftRectInfo.rect;
    }
    return rightRectInfo.rect;
  }

  private getRightMinDistanceRect(): {
    rect: RectInfo,
    distance: number
  } {
    if (!this.#size || !this.#parentRect) return {
      rect: DefaultRect,
      distance: -1
    };
    let start = this.#parentRect.x + this.#parentRect.width;
    let rect;
    let xInfo;
    let range;
    while (!rect) {
      xInfo = this.findMinXPosition({
        start,
        positive: true,
        rectList: this.#pageRectList
      });
      if (!xInfo.mergeList.length) {
        rect = {
          x: xInfo.x,
          y: this.#parentRect.y + this.#gap,
          width: this.#size.width,
          height: this.#size.height
        };
      } else {
        rect = this.findVerticalRect({
          xStart: xInfo.x,
          rectList: xInfo.mergeList,
          positive: true
        });
      }
      if (!rect) {
        range = OperatorUtils.getXRangeInRectList(xInfo.mergeList.reduce<RectInfo[]>((previous, current) => {
          if (OperatorUtils.checkY({from: current.y, to: current.y + current.height}, this.#parentRect!)) {
            return previous.concat(current);
          }
          return previous;
        }, []));
        if (range.from !== Mark.Unset) {
          start = range.to;
        } else {
          rect = DefaultRect;
        }
      }
    }
    return {
      rect,
      distance: OperatorUtils.getRectDistance(rect, this.#parentRect)
    };
  }

  private getLeftMinDistanceRect(): {
    rect: RectInfo,
    distance: number
  } {
    if (!this.#size || !this.#parentRect) return {
      rect: DefaultRect,
      distance: -1
    };
    let start = this.#parentRect.x;
    let rect;
    let xInfo;
    let range;
    while (!rect) {
      xInfo = this.findMinXPosition({
        start,
        positive: false,
        rectList: this.#pageRectList
      });
      if (!xInfo.mergeList.length) {
        rect = {
          x: xInfo.x,
          y: this.#parentRect.y + this.#gap,
          width: this.#size.width,
          height: this.#size.height
        };
      } else {
        rect = this.findVerticalRect({
          xStart: xInfo.x,
          rectList: xInfo.mergeList,
          positive: false
        });
      }
      if (!rect) {
        range = OperatorUtils.getXRangeInRectList(xInfo.mergeList.reduce<RectInfo[]>((previous, current) => {
          if (OperatorUtils.checkY({from: current.y, to: current.y + current.height}, this.#parentRect!)) {
            return previous.concat(current);
          }
          return previous;
        }, []));
        if (range.from !== Mark.Unset) {
          start = range.from;
        } else {
          rect = DefaultRect;
        }
      }
    }
    return {
      rect,
      distance: OperatorUtils.getRectDistance(rect, this.#parentRect)
    };
  }

  private getTopMinDistanceRect(): {
    rect: RectInfo,
    distance: number
  } {
    if (!this.#size || !this.#parentRect) return {
      rect: DefaultRect,
      distance: -1
    };
    let start = this.#parentRect.y;
    let rect;
    let yInfo;
    let range;
    while (!rect) {
      yInfo = this.findMinYPosition({
        start,
        positive: false,
        rectList: this.#pageRectList
      });
      if (!yInfo.mergeList.length) {
        rect = {
          x: this.#parentRect.x + this.#gap,
          y: yInfo.y,
          width: this.#size.width,
          height: this.#size.height
        };
      } else {
        rect = this.findHorizonRect(yInfo.y, yInfo.mergeList);
      }
      if (!rect) {
        range = OperatorUtils.getYRangeInRectList(yInfo.mergeList.reduce<RectInfo[]>((previous, current) => {
          if (OperatorUtils.checkX({from: current.x, to: current.x + current.width}, this.#parentRect!)) {
            return previous.concat(current);
          }
          return previous;
        }, []));
        if (range.from !== Mark.Unset) {
          start = range.from;
        } else {
          rect = DefaultRect;
        }
      }
    }
    return {
      rect,
      distance: OperatorUtils.getRectDistance(rect, this.#parentRect)
    };
  }

  private getBottomMinDistanceRect(): {
    rect: RectInfo,
    distance: number
  } {
    if (!this.#size || !this.#parentRect) return {
      rect: DefaultRect,
      distance: -1
    };
    let start = this.#parentRect.y + this.#parentRect.height;
    let rect;
    let yInfo;
    let range;
    while (!rect) {
      yInfo = this.findMinYPosition({
        start,
        positive: true,
        rectList: this.#pageRectList
      });
      if (!yInfo.mergeList.length) {
        rect = {
          x: this.#parentRect.x + this.#gap,
          y: yInfo.y,
          width: this.#size.width,
          height: this.#size.height
        };
      } else {
        rect = this.findHorizonRect(yInfo.y, yInfo.mergeList);
      }
      if (!rect) {
        range = OperatorUtils.getYRangeInRectList(yInfo.mergeList.reduce<RectInfo[]>((previous, current) => {
          if (OperatorUtils.checkX({from: current.x, to: current.x + current.width}, this.#parentRect!)) {
            return previous.concat(current);
          }
          return previous;
        }, []));
        if (range.to !== Mark.Unset) {
          start = range.to;
        } else {
          rect = DefaultRect;
        }
      }
    }
    return {
      rect,
      distance: OperatorUtils.getRectDistance(rect, this.#parentRect)
    };
  }

  private findMinXPosition(params: {
    start: number,
    rectList: RectInfo[],
    positive: boolean
  }): {
      x: number,
      mergeList: RectInfo[],
    } {
    if (!this.#size) return {
      x: 0,
      mergeList: []
    };
    let xStart;
    let xEnd;
    if (params.positive) {
      xStart = params.start;
      xEnd = params.start + this.#size.width + this.#gap;
    } else {
      xStart = params.start - this.#size.width - this.#gap;
      xEnd = params.start;
    }
    const mergeList = OperatorUtils.getRectListInXRange({
      from: xStart,
      to: xEnd
    }, params.rectList);
    if (params.positive) {
      xStart += this.#gap;
    }
    if (!mergeList.length) {
      return {
        x: xStart,
        mergeList
      };
    }
    return {
      x: xStart,
      mergeList
    };
  }

  private findVerticalRect(params: {
    xStart: number,
    rectList: RectInfo[],
    positive: boolean
  }): RectInfo | undefined {
    if (!this.#size || !this.#parentRect) return undefined;
    let positiveY;
    let positiveInfo;
    let positiveStart = this.#parentRect.y;
    let range;
    while (!positiveY) {
      positiveInfo = this.findMinYPosition({
        start: positiveStart,
        rectList: params.rectList,
        positive: true
      });
      if (!positiveInfo.mergeList.length) {
        positiveY = positiveInfo.y;
      } else {
        range = OperatorUtils.getYRangeInRectList(positiveInfo.mergeList);
        positiveStart = range.to;
      }
    }
    let negativeY;
    let negativeInfo;
    let negativeStart = this.#parentRect.y;
    while (!negativeY) {
      negativeInfo = this.findMinYPosition({
        start: negativeStart,
        rectList: params.rectList,
        positive: false
      });
      if (!negativeInfo.mergeList.length) {
        negativeY = negativeInfo.y;
      } else {
        range = OperatorUtils.getYRangeInRectList(negativeInfo.mergeList);
        negativeStart = range.from;
      }
    }
    const negativeRect = {
      x: params.xStart,
      y: negativeY,
      width: this.#size.width,
      height: this.#size.height
    };
    const positiveRect = {
      x: params.xStart,
      y: positiveY,
      width: this.#size.width,
      height: this.#size.height
    };
    const negativeDistance = OperatorUtils.getRectDistance(negativeRect, this.#parentRect);
    const positiveDistance = OperatorUtils.getRectDistance(positiveRect, this.#parentRect);
    const xRange = OperatorUtils.getXRangeInRectList(params.rectList);
    let maxDistance;
    if (params.positive) {
      maxDistance = xRange.to - this.#parentRect.x - this.#parentRect.width;
    } else {
      maxDistance = this.#parentRect.x - xRange.from;
    }
    if (negativeDistance < maxDistance || positiveDistance < maxDistance) {
      if (negativeDistance <= positiveDistance) {
        return negativeRect;
      }
      return positiveRect;
    }
    return undefined;
  }

  private findHorizonRect(yStart: number, rectList: RectInfo[]): RectInfo | undefined {
    if (!this.#size || !this.#parentRect) return undefined;
    let positiveX;
    let positiveInfo;
    let positiveStart = this.#parentRect.x;
    while (!positiveX) {
      positiveInfo = this.findMinXPosition({
        start: positiveStart,
        rectList,
        positive: true
      });
      if (!positiveInfo.mergeList.length) {
        positiveX = positiveInfo.x;
      } else {
        const range = OperatorUtils.getXRangeInRectList(positiveInfo.mergeList);
        positiveStart = range.to;
      }
    }
    if (positiveX <= (this.#parentRect.x + this.#parentRect.width)) {
      return {
        x: positiveX,
        y: yStart,
        width: this.#size.width,
        height: this.#size.height
      };
    }
    return undefined;
  }

  private findMinYPosition(params: {
    start:number,
    rectList: RectInfo[],
    positive: boolean
  }): {
      y: number,
      mergeList: RectInfo[]
    } {
    if (!this.#size) return {
      y: 0,
      mergeList: []
    };
    let yStart;
    let yEnd;
    if (params.positive) {
      yStart = params.start;
      yEnd = params.start + this.#size.height + this.#gap;
    } else {
      yStart = params.start - this.#size.height - this.#gap;
      yEnd = params.start;
    }
    const mergeList = OperatorUtils.getRectListInYRange({from: yStart, to: yEnd}, params.rectList);
    if (params.positive) {
      yStart += this.#gap;
    }
    if (!mergeList.length) {
      return {
        y: yStart,
        mergeList
      };
    }
    return {
      y: yStart,
      mergeList
    };
  }
}

