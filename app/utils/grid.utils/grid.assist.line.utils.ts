/*
 * @author allen
 * @data 2020/12/14 17:04
 */
import { SizeUnit } from 'towify-editor-common-values';
import { LineInfo, RectInfo } from '../../type/common.type';
import { SignInfo } from '../../type/interact.type';
import { NumberUtils } from '../number.utils/number.utils';
import { ErrorUtils } from '../error.utils/error.utils';
import { GridMapping } from '../../mapping/grid.mapping/grid.mapping';

export class GridAssistLineUtils {
  static getAssistLinesAndSignsByActivePoint(
    rect: RectInfo,
    activeBorder: {
      left: number;
      top: number;
      right: number;
      bottom: number;
    }
  ): {
    lines: LineInfo[];
    signs: SignInfo[];
  } {
    const lines: LineInfo[] = [];
    const signs: SignInfo[] = [];
    if (activeBorder.left !== Number.MIN_VALUE) {
      const offLeft = NumberUtils.parseViewNumber(rect.x - activeBorder.left);
      const leftY = rect.y + rect.height / 2;
      if (
        offLeft >= 0 &&
        leftY < activeBorder.bottom &&
        leftY > activeBorder.top
      ) {
        lines.push({
          fromX: rect.x,
          toX: activeBorder.left,
          fromY: leftY,
          toY: leftY
        });
        signs.push({
          x: activeBorder.left + offLeft / 2,
          y: leftY - 16,
          sign: `${offLeft} ${SizeUnit.PX}`
        });
      }
    }
    if (activeBorder.right !== Number.MIN_VALUE) {
      const offRight = NumberUtils.parseViewNumber(
        activeBorder.right - (rect.x + rect.width)
      );
      const rightY = rect.y + rect.height / 2;
      if (
        offRight >= 0 &&
        rightY < activeBorder.bottom &&
        rightY > activeBorder.top
      ) {
        lines.push({
          fromX: rect.x + rect.width,
          toX: activeBorder.right,
          fromY: rightY,
          toY: rightY
        });
        signs.push({
          x: activeBorder.right - offRight / 2,
          y: rightY - 16,
          sign: `${offRight} ${SizeUnit.PX}`
        });
      }
    }
    if (activeBorder.top !== Number.MIN_VALUE) {
      const offTop = NumberUtils.parseViewNumber(rect.y - activeBorder.top);
      const topX = rect.x + rect.width / 2;
      if (
        offTop >= 0 &&
        topX < activeBorder.right &&
        topX > activeBorder.left
      ) {
        lines.push({
          fromX: topX,
          toX: topX,
          fromY: rect.y,
          toY: activeBorder.top
        });
        signs.push({
          x: topX + 25 + offTop.toString().length * 3,
          y: activeBorder.top + offTop / 2 + 6,
          sign: `${offTop} ${SizeUnit.PX}`
        });
      }
    }
    if (activeBorder.bottom !== Number.MIN_VALUE) {
      const offBottom = NumberUtils.parseViewNumber(
        activeBorder.bottom - (rect.y + rect.height)
      );
      const bottomX = rect.x + rect.width / 2;
      if (
        offBottom >= 0 &&
        bottomX < activeBorder.right &&
        bottomX > activeBorder.left
      ) {
        lines.push({
          fromX: bottomX,
          toX: bottomX,
          fromY: rect.y + rect.height,
          toY: activeBorder.bottom
        });
        signs.push({
          x: bottomX + 25 + offBottom.toString().length * 3,
          y: activeBorder.bottom - offBottom / 2 + 6,
          sign: `${offBottom} ${SizeUnit.PX}`
        });
      }
    }
    return {
      lines,
      signs
    };
  }

  static getAssistLinesAndSigns(
    movingInfo: {
      movingId: string;
      movingOffsetX: number;
      movingOffsetY: number;
    },
    gridManager: GridMapping
  ): {
    lines: LineInfo[];
    signs: SignInfo[];
  } {
    const moveChild = gridManager.childInfoList.find(child => {
      return child.id === movingInfo.movingId;
    });
    if (!moveChild) {
      ErrorUtils.GridError('Moving layer is not find');
      return {
        lines: [],
        signs: []
      };
    }
    const childRect = gridManager.getGridChildRect(moveChild);
    const movingRect = {
      x: childRect.x + movingInfo.movingOffsetX,
      y: childRect.y + movingInfo.movingOffsetY,
      width: childRect.width,
      height: childRect.height
    };
    const gridItemRectList = gridManager.getGridItemRectList();
    const activeAreaInfo = gridManager.getChildGridAreaInfoByRect({
      rect: movingRect,
      gridItemRectList
    });
    const activeGridItemRect =
      gridItemRectList[activeAreaInfo.gridArea.rowStart - 1][
        activeAreaInfo.gridArea.columnStart - 1
      ];
    if (activeGridItemRect) {
      return GridAssistLineUtils.getAssistLinesAndSignsByActivePoint(
        movingRect,
        {
          left: activeGridItemRect.x,
          top: activeGridItemRect.y,
          right: activeGridItemRect.x + activeGridItemRect.width,
          bottom: activeGridItemRect.y + activeGridItemRect.height
        }
      );
    }
    return GridAssistLineUtils.getAssistLinesAndSignsByActivePoint(movingRect, {
      left: 0,
      top: 0,
      right: Number.MIN_VALUE,
      bottom: Number.MIN_VALUE
    });
  }
}
