/*
 * @author allen
 * @data 2020/12/14 17:22
 */
import { LineInfo, RectInfo } from '../../type/common.type';
import { AlignOffsetInfo } from '../../type/interact.type';
import {ErrorUtils} from '../error.utils/error.utils';
import {GridManager} from '../../manager/gird.manager/grid.manager';

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
    isNeedMiddle: boolean,
    gridManager: GridManager
    movingLayerId: string,
  }): {
      layerCenterList: number[],
      layerMiddleList: number[],
      layerXList: number[],
      layerYList: number[],
    } {
    const layerCenterList: number[] = [];
    const layerMiddleList: number[] = [];
    const layerXList: number[] = [];
    const layerYList: number[] = [];
    const canvasMinLeft = params.gridManager.gridActiveRect.x;
    const canvasMaxRight =
      params.gridManager.gridActiveRect.x + params.gridManager.gridActiveRect.width;
    const canvasMinTop = params.gridManager.gridActiveRect.y;
    const canvasMaxBottom =
      params.gridManager.gridActiveRect.y +
      params.gridManager.gridActiveRect.height;
    const canvasCenterX =
      params.gridManager.gridActiveRect.x +
      params.gridManager.gridActiveRect.width / 2;
    const canvasCenterY =
      params.gridManager.gridActiveRect.y +
      params.gridManager.gridActiveRect.height / 2;
    if (params.isNeedMiddle) {
      layerCenterList.push(canvasCenterX);
      layerMiddleList.push(canvasCenterY);
    }
    layerXList.push(canvasMinLeft);
    layerXList.push(canvasMaxRight);
    layerYList.push(canvasMinTop);
    layerYList.push(canvasMaxBottom);
    params.gridManager.childInfoList.forEach(child => {
      if (child.rect && child.id !== params.movingLayerId) {
        const minLeft = child.rect.x;
        const maxRight = child.rect.x + child.rect.width;
        const minTop = child.rect.y;
        const maxBottom = child.rect.y + child.rect.height;
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
          const centerX = child.rect.x + child.rect.width / 2;
          const centerY = child.rect.y + child.rect.height / 2;
          if (layerCenterList.indexOf(centerX) === -1) {
            layerCenterList.push(centerX);
          }
          if (layerMiddleList.indexOf(centerY) === -1) {
            layerMiddleList.push(centerY);
          }
        }
      }
    });
    const itemRectList = params.gridManager.getGridItemRectList();
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
