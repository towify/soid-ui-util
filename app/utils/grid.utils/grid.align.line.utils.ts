/*
 * @author allen
 * @data 2020/12/14 17:22
 */
import { ComponentResizeType, LineInfo, PlaceSelfInfo, RectInfo } from '../../type/common.type';
import { AlignOffsetInfo } from '../../type/interact.type';
import { GridMapping } from '../../mapping/grid.mapping/grid.mapping';

export class GridAlignLineUtils {
  static getClosestValueInPositionList(params: {
    value: number;
    list: number[];
    offset: number;
  }): number | undefined {
    const checkNumber = params.list.find(item => Math.abs(item - params.value) < params.offset);
    if (checkNumber !== undefined) {
      if (checkNumber === params.value) {
        return 0;
      }
      return checkNumber - params.value;
    }
    return undefined;
  }

  static getAlignLineByResizeRect(params: {
    rect: RectInfo;
    resizeType: ComponentResizeType;
    xList: number[];
    yList: number[];
    offset: number;
    placeSelf: PlaceSelfInfo;
    gridActiveRect: RectInfo;
  }): {
    rect: RectInfo;
    xAlignLine: LineInfo | undefined;
    yAlignLine: LineInfo | undefined;
  } {
    let offsetX = 0;
    let offsetY = 0;
    let xAlignLine;
    let yAlignLine;
    const allAlignEnable =
      params.resizeType === 'top-left' ||
      params.resizeType === 'top-right' ||
      params.resizeType === 'bottom-left' ||
      params.resizeType === 'bottom-right';
    const xAlignEnable =
      params.resizeType === 'left' || params.resizeType === 'right' || allAlignEnable;
    const yAlignEnable =
      params.resizeType === 'top' || params.resizeType === 'bottom' || allAlignEnable;
    if (xAlignEnable) {
      const xOffValue =
        params.resizeType === 'left' ||
        params.resizeType === 'top-left' ||
        params.resizeType === 'bottom-left'
          ? params.rect.x
          : params.rect.x + params.rect.width;
      const offsetHorizontal = GridAlignLineUtils.getClosestValueInPositionList({
        value: xOffValue,
        list: params.xList,
        offset: params.offset
      });
      if (offsetHorizontal !== undefined) {
        offsetX = offsetHorizontal;
        xAlignLine = xOffValue + offsetX;
      }
    }
    if (yAlignEnable) {
      const yOffValue =
        params.resizeType === 'top' ||
        params.resizeType === 'top-left' ||
        params.resizeType === 'top-right'
          ? params.rect.y
          : params.rect.y + params.rect.height;
      const offsetVertical = GridAlignLineUtils.getClosestValueInPositionList({
        value: yOffValue,
        list: params.yList,
        offset: params.offset
      });
      if (offsetVertical !== undefined) {
        offsetY = offsetVertical;
        yAlignLine = yOffValue + offsetY;
      }
    }
    const minX = params.gridActiveRect.x;
    const maxX = params.gridActiveRect.x + params.gridActiveRect.width;
    const minY = params.gridActiveRect.y;
    const maxY = params.gridActiveRect.y + params.gridActiveRect.height;
    return {
      rect: GridAlignLineUtils.getAlignResizeRect({
        rect: params.rect,
        resizeType: params.resizeType,
        offset: {
          x: offsetX,
          y: offsetY
        },
        placeSelf: params.placeSelf
      }),
      xAlignLine: xAlignLine
        ? {
            fromX: xAlignLine,
            toX: xAlignLine,
            fromY: minY,
            toY: maxY
          }
        : undefined,
      yAlignLine: yAlignLine
        ? {
            fromX: minX,
            toX: maxX,
            fromY: yAlignLine,
            toY: yAlignLine
          }
        : undefined
    };
  }

  static getAlignResizeRect(params: {
    rect: RectInfo;
    resizeType: ComponentResizeType;
    offset: AlignOffsetInfo;
    placeSelf: PlaceSelfInfo;
  }): RectInfo {
    let rectX = params.rect.x;
    let rectY = params.rect.y;
    let rectWidth = params.rect.width;
    let rectHeight = params.rect.height;
    if (
      params.resizeType === 'left' ||
      params.resizeType === 'bottom-left' ||
      params.resizeType === 'top-left'
    ) {
      rectX += params.offset.x;
      rectWidth -=
        params.placeSelf.justifySelf === 'center' ? params.offset.x * 2 : params.offset.x;
    }
    if (
      params.resizeType === 'right' ||
      params.resizeType === 'bottom-right' ||
      params.resizeType === 'top-right'
    ) {
      rectX -= params.placeSelf.justifySelf === 'center' ? params.offset.x : 0;
      rectWidth +=
        params.placeSelf.justifySelf === 'center' ? params.offset.x * 2 : params.offset.x;
    }
    if (
      params.resizeType === 'top' ||
      params.resizeType === 'top-right' ||
      params.resizeType === 'top-left'
    ) {
      rectY += params.offset.y;
      rectHeight -= params.placeSelf.alignSelf === 'center' ? params.offset.y * 2 : params.offset.y;
    }
    if (
      params.resizeType === 'bottom' ||
      params.resizeType === 'bottom-right' ||
      params.resizeType === 'bottom-left'
    ) {
      rectY -= params.placeSelf.alignSelf === 'center' ? params.offset.y : 0;
      rectHeight += params.placeSelf.alignSelf === 'center' ? params.offset.y * 2 : params.offset.y;
    }
    return {
      x: rectX,
      y: rectY,
      width: rectWidth,
      height: rectHeight
    };
  }

  static getAlignLineByMoveRect(params: {
    rect: RectInfo;
    xList: number[];
    yList: number[];
    centerList: number[];
    middleList: number[];
    offset: number;
    gridActiveRect: RectInfo;
  }): {
    lines: LineInfo[];
    offset: AlignOffsetInfo;
  } {
    let offsetX = 0;
    let offsetY = 0;
    const xAlignLines: number[] = [];
    const yAlignLines: number[] = [];
    const offsetCenter = GridAlignLineUtils.getClosestValueInPositionList({
      value: params.rect.x + params.rect.width / 2,
      list: params.centerList,
      offset: params.offset
    });
    const offsetMiddle = GridAlignLineUtils.getClosestValueInPositionList({
      value: params.rect.y + params.rect.height / 2,
      list: params.middleList,
      offset: params.offset
    });
    const offsetLeft = GridAlignLineUtils.getClosestValueInPositionList({
      value: params.rect.x,
      list: params.xList,
      offset: params.offset
    });
    const offsetRight = GridAlignLineUtils.getClosestValueInPositionList({
      value: params.rect.x + params.rect.width,
      list: params.xList,
      offset: params.offset
    });
    const offsetTop = GridAlignLineUtils.getClosestValueInPositionList({
      value: params.rect.y,
      list: params.yList,
      offset: params.offset
    });
    const offsetBottom = GridAlignLineUtils.getClosestValueInPositionList({
      value: params.rect.y + params.rect.height,
      list: params.yList,
      offset: params.offset
    });
    if (offsetCenter !== undefined) {
      offsetX = offsetCenter;
      xAlignLines.push(params.rect.x + params.rect.width / 2 + offsetX);
      if (offsetLeft && Math.abs(offsetCenter - offsetLeft) < 0.001) {
        xAlignLines.push(params.rect.x + offsetX);
      }
      if (offsetRight && Math.abs(offsetCenter - offsetRight) < 0.001) {
        xAlignLines.push(params.rect.x + params.rect.width + offsetX);
      }
    } else if (offsetLeft !== undefined) {
      offsetX = offsetLeft;
      xAlignLines.push(params.rect.x + offsetX);
      if (offsetRight && Math.abs(offsetLeft - offsetRight) < 0.001) {
        xAlignLines.push(params.rect.x + params.rect.width + offsetX);
      }
    } else if (offsetRight !== undefined) {
      offsetX = offsetRight;
      xAlignLines.push(params.rect.x + params.rect.width + offsetX);
    }
    if (offsetMiddle !== undefined) {
      offsetY = offsetMiddle;
      yAlignLines.push(params.rect.y + params.rect.height / 2 + offsetY);
      if (offsetTop && Math.abs(offsetMiddle - offsetTop) < 0.001) {
        yAlignLines.push(params.rect.y + offsetY);
      }
      if (offsetBottom && Math.abs(offsetMiddle - offsetBottom) < 0.001) {
        yAlignLines.push(params.rect.y + params.rect.height + offsetY);
      }
    } else if (offsetTop !== undefined) {
      offsetY = offsetTop;
      yAlignLines.push(params.rect.y + offsetY);
      if (offsetBottom && Math.abs(offsetTop - offsetBottom) < 0.001) {
        yAlignLines.push(params.rect.y + params.rect.height + offsetY);
      }
    } else if (offsetBottom !== undefined) {
      offsetY = offsetBottom;
      yAlignLines.push(params.rect.y + params.rect.height + offsetY);
    }
    return {
      offset: {
        x: offsetX,
        y: offsetY
      },
      lines: GridAlignLineUtils.getAlignLine({
        gridActiveRect: params.gridActiveRect,
        xAlignLines,
        yAlignLines
      })
    };
  }

  static getAlignLine(params: {
    gridActiveRect: RectInfo;
    xAlignLines: number[];
    yAlignLines: number[];
  }): LineInfo[] {
    const lines: LineInfo[] = [];
    const minX = params.gridActiveRect.x;
    const maxX = params.gridActiveRect.x + params.gridActiveRect.width;
    const minY = params.gridActiveRect.y;
    const maxY = params.gridActiveRect.y + params.gridActiveRect.height;
    params.xAlignLines.forEach(xNumber => {
      lines.push({
        fromX: xNumber,
        toX: xNumber,
        fromY: minY,
        toY: maxY
      });
    });
    params.yAlignLines.forEach(yNumber => {
      lines.push({
        fromX: minX,
        toX: maxX,
        fromY: yNumber,
        toY: yNumber
      });
    });
    return lines;
  }

  static prepareAlignLine(params: {
    isNeedMiddle: boolean;
    gridMapping: GridMapping;
    activeId?: string;
  }): {
    layerCenterList: number[];
    layerMiddleList: number[];
    layerXList: number[];
    layerYList: number[];
  } {
    const layerCenterList: number[] = [];
    const layerMiddleList: number[] = [];
    const layerXList: number[] = [];
    const layerYList: number[] = [];
    const canvasMinLeft = params.gridMapping.gridActiveRect.x;
    const canvasMaxRight =
      params.gridMapping.gridActiveRect.x + params.gridMapping.gridActiveRect.width;
    const canvasMinTop = params.gridMapping.gridActiveRect.y;
    const canvasMaxBottom =
      params.gridMapping.gridActiveRect.y + params.gridMapping.gridActiveRect.height;
    const canvasCenterX =
      params.gridMapping.gridActiveRect.x + params.gridMapping.gridActiveRect.width / 2;
    const canvasCenterY =
      params.gridMapping.gridActiveRect.y + params.gridMapping.gridActiveRect.height / 2;
    if (params.isNeedMiddle) {
      layerCenterList.push(canvasCenterX);
      layerMiddleList.push(canvasCenterY);
    }
    layerXList.push(canvasMinLeft);
    layerXList.push(canvasMaxRight);
    layerYList.push(canvasMinTop);
    layerYList.push(canvasMaxBottom);
    let childRect;
    params.gridMapping.childInfoList.forEach(child => {
      childRect = params.gridMapping.getGridChildRect(child);
      if (child.id !== params.activeId) {
        const minLeft = childRect.x;
        const maxRight = childRect.x + childRect.width;
        const minTop = childRect.y;
        const maxBottom = childRect.y + childRect.height;
        if (layerXList.indexOf(maxRight) === -1) {
          layerXList.push(maxRight);
        }
        if (layerXList.indexOf(minLeft) === -1) {
          layerXList.push(minLeft);
        }
        if (layerYList.indexOf(minTop) === -1) {
          layerYList.push(minTop);
        }
        if (layerYList.indexOf(maxBottom) === -1) {
          layerYList.push(maxBottom);
        }
        if (params.isNeedMiddle) {
          const centerX = childRect.x + childRect.width / 2;
          const centerY = childRect.y + childRect.height / 2;
          if (layerCenterList.indexOf(centerX) === -1) {
            layerCenterList.push(centerX);
          }
          if (layerMiddleList.indexOf(centerY) === -1) {
            layerMiddleList.push(centerY);
          }
        }
      }
    });
    const itemRectList = params.gridMapping.getGridItemRectList();
    itemRectList.forEach(rowItem => {
      rowItem.forEach(rect => {
        if (params.isNeedMiddle) {
          const centerX = rect.x + rect.width / 2;
          const centerY = rect.y + rect.height / 2;
          if (layerCenterList.indexOf(centerX) === -1) {
            layerCenterList.push(centerX);
          }
          if (layerMiddleList.indexOf(centerY) === -1) {
            layerMiddleList.push(centerY);
          }
        }
      });
    });
    return {
      layerCenterList,
      layerMiddleList,
      layerXList,
      layerYList
    };
  }
}
