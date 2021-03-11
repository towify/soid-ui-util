/*
 * @author allen
 * @data 2020/12/14 17:22
 */
import { LineInfo, RectInfo } from '../../type/common.type';
import { AlignOffsetInfo } from '../../type/interact.type';
import { GridMapping } from '../../mapping/grid.mapping/grid.mapping';

export class GridAlignLineUtils {
  static getClosestValueInPositionList(params: {
    value: number;
    list: number[];
    offset: number;
  }): number | undefined {
    const checkNumber = params.list.find(
      item => Math.abs(item - params.value) < params.offset
    );
    if (checkNumber !== undefined) {
      if (checkNumber === params.value) {
        return 0;
      }
      return checkNumber - params.value;
    }
    return undefined;
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
    let offsetLeft: number | undefined;
    let offsetRight: number | undefined;
    let offsetTop: number | undefined;
    let offsetBottom: number | undefined;
    if (offsetCenter !== undefined) {
      offsetX = offsetCenter;
      xAlignLines.push(params.rect.x + params.rect.width / 2 + offsetX);
    } else {
      offsetLeft = GridAlignLineUtils.getClosestValueInPositionList({
        value: params.rect.x,
        list: params.xList,
        offset: params.offset
      });
      offsetRight = GridAlignLineUtils.getClosestValueInPositionList({
        value: params.rect.x + params.rect.width,
        list: params.xList,
        offset: params.offset
      });
      if (offsetLeft !== undefined) {
        offsetX = offsetLeft;
        xAlignLines.push(params.rect.x + offsetX);
        if (offsetRight !== undefined && offsetRight === offsetLeft) {
          xAlignLines.push(params.rect.x + params.rect.width + offsetX);
        }
      } else if (offsetRight !== undefined) {
        offsetX = offsetRight;
        xAlignLines.push(params.rect.x + params.rect.width + offsetX);
      }
    }
    if (offsetMiddle !== undefined) {
      offsetY = offsetMiddle;
      yAlignLines.push(params.rect.y + params.rect.height / 2 + offsetY);
    } else {
      offsetTop = GridAlignLineUtils.getClosestValueInPositionList({
        value: params.rect.y,
        list: params.yList,
        offset: params.offset
      });
      offsetBottom = GridAlignLineUtils.getClosestValueInPositionList({
        value: params.rect.y + params.rect.height,
        list: params.yList,
        offset: params.offset
      });
      if (offsetTop !== undefined) {
        offsetY = offsetTop;
        yAlignLines.push(params.rect.y + offsetY);
        if (offsetBottom !== undefined && offsetBottom === offsetTop) {
          yAlignLines.push(params.rect.y + params.rect.height + offsetY);
        }
      } else if (offsetBottom !== undefined) {
        offsetY = offsetBottom;
        yAlignLines.push(params.rect.y + params.rect.height + offsetY);
      }
    }
    const lines: LineInfo[] = [];
    const minX = params.gridActiveRect.x;
    const maxX = params.gridActiveRect.x + params.gridActiveRect.width;
    const minY = params.gridActiveRect.y;
    const maxY = params.gridActiveRect.y + params.gridActiveRect.height;
    xAlignLines.forEach(xNumber => {
      lines.push({
        fromX: xNumber,
        toX: xNumber,
        fromY: minY,
        toY: maxY
      });
    });
    yAlignLines.forEach(yNumber => {
      lines.push({
        fromX: minX,
        toX: maxX,
        fromY: yNumber,
        toY: yNumber
      });
    });
    return {
      offset: {
        x: offsetX,
        y: offsetY
      },
      lines
    };
  }

  static prepareAlignLine(params: {
    isNeedMiddle: boolean;
    gridMapping: GridMapping;
    movingLayerId: string;
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
      params.gridMapping.gridActiveRect.x +
      params.gridMapping.gridActiveRect.width;
    const canvasMinTop = params.gridMapping.gridActiveRect.y;
    const canvasMaxBottom =
      params.gridMapping.gridActiveRect.y +
      params.gridMapping.gridActiveRect.height;
    const canvasCenterX =
      params.gridMapping.gridActiveRect.x +
      params.gridMapping.gridActiveRect.width / 2;
    const canvasCenterY =
      params.gridMapping.gridActiveRect.y +
      params.gridMapping.gridActiveRect.height / 2;
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
      if (child.id !== params.movingLayerId) {
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
