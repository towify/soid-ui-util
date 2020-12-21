/*
 * @author allen
 * @data 2020/12/14 17:22
 */
import { LineInfo, RectInfo } from '../../type/common.type';
import { AlignDefaultOffset, AlignOffsetInfo } from '../../type/interact.type';
import { ErrorUtils } from '../error.utils/error.utils';
import { GridManager } from '../../manager/gird.manager/grid.manager';

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
    gridManager: GridManager;
  }): {
    lines: LineInfo[];
    offset: AlignOffsetInfo;
  } {
    if (!params.gridManager.gridActiveRect) {
      ErrorUtils.InteractError('GridSize is undefined');
      return {
        lines: [],
        offset: AlignDefaultOffset
      };
    }
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
    const minX = params.gridManager.gridActiveRect.x;
    const maxX =
      params.gridManager.gridActiveRect.x +
      params.gridManager.gridActiveRect.width;
    const minY = params.gridManager.gridActiveRect.y;
    const maxY =
      params.gridManager.gridActiveRect.y +
      params.gridManager.gridActiveRect.height;
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
}
