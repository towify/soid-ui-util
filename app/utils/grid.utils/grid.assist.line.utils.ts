/*
 * @author allen
 * @data 2020/12/14 17:04
 */
import { Mark, SizeUnit } from 'towify-editor-common-values';
import { LineInfo, RectInfo } from '../../type/common.type';
import { SignInfo } from '../../type/interact.type';
import { NumberUtils } from '../number.utils/number.utils';
import { ErrorUtils } from '../error.utils/error.utils';
import { GridManager } from '../../manager/gird.manager/grid.manager';

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
    if (activeBorder.left !== Mark.Unset) {
      const offLeft = NumberUtils.parseViewNumber(rect.x - activeBorder.left);
      if (offLeft >= 0) {
        lines.push({
          fromX: rect.x,
          toX: activeBorder.left,
          fromY: rect.y + rect.height / 2,
          toY: rect.y + rect.height / 2
        });
        signs.push({
          x: activeBorder.left + offLeft / 2,
          y: rect.y + rect.height / 2 - 22,
          sign: offLeft + SizeUnit.PX
        });
      }
    }
    if (activeBorder.right !== Mark.Unset) {
      const offRight = NumberUtils.parseViewNumber(
        activeBorder.right - (rect.x + rect.width)
      );
      if (offRight >= 0) {
        lines.push({
          fromX: rect.x + rect.width,
          toX: activeBorder.right,
          fromY: rect.y + rect.height / 2,
          toY: rect.y + rect.height / 2
        });
        signs.push({
          x: activeBorder.right - offRight / 2,
          y: rect.y + rect.height / 2 - 22,
          sign: offRight + SizeUnit.PX
        });
      }
    }
    if (activeBorder.top !== Mark.Unset) {
      const offTop = NumberUtils.parseViewNumber(rect.y - activeBorder.top);
      if (offTop >= 0) {
        lines.push({
          fromX: rect.x + rect.width / 2,
          toX: rect.x + rect.width / 2,
          fromY: rect.y,
          toY: activeBorder.top
        });
        signs.push({
          x: rect.x + rect.width / 2 + 35,
          y: activeBorder.top + offTop / 2 + 5,
          sign: offTop + SizeUnit.PX
        });
      }
    }
    if (activeBorder.bottom !== Mark.Unset) {
      const offBottom = NumberUtils.parseViewNumber(
        activeBorder.bottom - (rect.y + rect.height)
      );
      if (offBottom >= 0) {
        lines.push({
          fromX: rect.x + rect.width / 2,
          toX: rect.x + rect.width / 2,
          fromY: rect.y + rect.height,
          toY: activeBorder.bottom
        });
        signs.push({
          x: rect.x + rect.width / 2 + 35,
          y: activeBorder.bottom - offBottom / 2 + 5,
          sign: offBottom + SizeUnit.PX
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
    gridManager: GridManager
  ): {
    lines: LineInfo[];
    signs: SignInfo[];
  } {
    const moveChild = gridManager.childInfoList.find(child => {
      return child.id === movingInfo.movingId;
    });
    if (!moveChild || !moveChild.rect) {
      ErrorUtils.GridError('Moving layer is not find');
      return {
        lines: [],
        signs: []
      };
    }
    const movingRect = {
      x: moveChild.rect.x + movingInfo.movingOffsetX,
      y: moveChild.rect.y + movingInfo.movingOffsetY,
      width: moveChild.rect.width,
      height: moveChild.rect.height
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
      right: Mark.Unset,
      bottom: Mark.Unset
    });
  }
}
