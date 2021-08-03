/*
 * @author allen
 * @data 2020/12/14 17:04
 */
import { SizeUnit } from '@towify/common-values';
import { GridChildInfo, LineInfo, RectInfo } from '../../type/common.type';
import { SignInfo } from '../../type/interact.type';
import { NumberUtils } from '../number.utils/number.utils';
import { GridMapping } from '../../mapping/grid.mapping/grid.mapping';
import { GridUtils } from './grid.utils';

export class GridAssistLineUtils {
  static getAssistLinesAndSignsByActivePoint(
    rect: RectInfo,
    gridRect?: RectInfo,
    marginUnits?: {
      left: SizeUnit.PX | SizeUnit.Percent;
      right: SizeUnit.PX | SizeUnit.Percent;
      top: SizeUnit.PX | SizeUnit.Percent;
      bottom: SizeUnit.PX | SizeUnit.Percent;
    }
  ): {
    lines: LineInfo[];
    signs: SignInfo[];
  } {
    const lines: LineInfo[] = [];
    const signs: SignInfo[] = [];
    const activeBorder = gridRect
      ? {
          left: gridRect.x,
          top: gridRect.y,
          right: gridRect.x + gridRect.width,
          bottom: gridRect.y + gridRect.height
        }
      : {
          left: 0,
          top: 0,
          right: Number.MIN_VALUE,
          bottom: Number.MIN_VALUE
        };
    const maxValue = gridRect ? gridRect.width : 1;
    if (activeBorder.left !== Number.MIN_VALUE) {
      const offLeft =
        marginUnits?.left === SizeUnit.Percent
          ? parseFloat((((rect.x - activeBorder.left) * 100) / maxValue).toFixed(2))
          : NumberUtils.parseViewNumber(rect.x - activeBorder.left);
      const leftY = rect.y + rect.height / 2;
      if (offLeft >= 0 && leftY > activeBorder.top && leftY < activeBorder.bottom) {
        lines.push({
          fromX: rect.x,
          toX: activeBorder.left,
          fromY: leftY,
          toY: leftY
        });
        signs.push({
          x: activeBorder.left + NumberUtils.parseViewNumber(rect.x - activeBorder.left) / 2,
          y: leftY - 16,
          sign: `${offLeft} ${marginUnits?.left ?? SizeUnit.PX}`
        });
      }
    }
    if (activeBorder.right !== Number.MIN_VALUE && rect.width > 0) {
      const offRight =
        marginUnits?.right === SizeUnit.Percent
          ? parseFloat((((activeBorder.right - (rect.x + rect.width)) * 100) / maxValue).toFixed(2))
          : NumberUtils.parseViewNumber(activeBorder.right - (rect.x + rect.width));
      const rightY = rect.y + rect.height / 2;
      if (offRight >= 0 && rightY > activeBorder.top && rightY < activeBorder.bottom) {
        lines.push({
          fromX: rect.x + rect.width,
          toX: activeBorder.right,
          fromY: rightY,
          toY: rightY
        });
        signs.push({
          x:
            activeBorder.right -
            NumberUtils.parseViewNumber(activeBorder.right - (rect.x + rect.width)) / 2,
          y: rightY - 16,
          sign: `${offRight} ${marginUnits?.right ?? SizeUnit.PX}`
        });
      }
    }
    if (activeBorder.top !== Number.MIN_VALUE) {
      const offTop =
        marginUnits?.top === SizeUnit.Percent
          ? parseFloat((((rect.y - activeBorder.top) * 100) / maxValue).toFixed(2))
          : NumberUtils.parseViewNumber(rect.y - activeBorder.top);
      const topX = rect.x + rect.width / 2;
      if (offTop >= 0 && topX > activeBorder.left && topX < activeBorder.right) {
        lines.push({
          fromX: topX,
          toX: topX,
          fromY: rect.y,
          toY: activeBorder.top
        });
        signs.push({
          x: topX + 25 + offTop.toString().length * 3,
          y: activeBorder.top + NumberUtils.parseViewNumber(rect.y - activeBorder.top) / 2 + 6,
          sign: `${offTop} ${marginUnits?.top ?? SizeUnit.PX}`
        });
      }
    }
    if (activeBorder.bottom !== Number.MIN_VALUE && rect.height > 0) {
      const offBottom =
        marginUnits?.bottom === SizeUnit.Percent
          ? parseFloat(
              (((activeBorder.bottom - (rect.y + rect.height)) * 100) / maxValue).toFixed(2)
            )
          : NumberUtils.parseViewNumber(activeBorder.bottom - (rect.y + rect.height));
      const bottomX = rect.x + rect.width / 2;
      if (offBottom >= 0 && bottomX > activeBorder.left && bottomX < activeBorder.right) {
        lines.push({
          fromX: bottomX,
          toX: bottomX,
          fromY: rect.y + rect.height,
          toY: activeBorder.bottom
        });
        signs.push({
          x: bottomX + 25 + offBottom.toString().length * 3,
          y:
            activeBorder.bottom -
            NumberUtils.parseViewNumber(activeBorder.bottom - (rect.y + rect.height)) / 2 +
            6,
          sign: `${offBottom} ${marginUnits?.bottom ?? SizeUnit.PX}`
        });
      }
    }
    return {
      lines,
      signs
    };
  }

  static getAssistLinesAndSigns(params: {
    movingRect: RectInfo;
    gridMapping: GridMapping;
    moveChild?: GridChildInfo;
  }): {
    lines: LineInfo[];
    signs: SignInfo[];
  } {
    const activeAreaInfo = params.gridMapping.getChildGridAreaInfoByRect(params.movingRect);
    const activeGridItemRect = GridUtils.convertChildSizeInfoToNumber({
      gridArea: activeAreaInfo.gridArea,
      gridItemRectList: params.gridMapping.getGridItemRectList()
    });
    if (activeGridItemRect) {
      return GridAssistLineUtils.getAssistLinesAndSignsByActivePoint(
        params.movingRect,
        activeGridItemRect,
        {
          top:
            params.moveChild?.margin.top.unit === SizeUnit.Percent ? SizeUnit.Percent : SizeUnit.PX,
          bottom:
            params.moveChild?.margin.bottom.unit === SizeUnit.Percent
              ? SizeUnit.Percent
              : SizeUnit.PX,
          left:
            params.moveChild?.margin.left.unit === SizeUnit.Percent
              ? SizeUnit.Percent
              : SizeUnit.PX,
          right:
            params.moveChild?.margin.right.unit === SizeUnit.Percent
              ? SizeUnit.Percent
              : SizeUnit.PX
        }
      );
    }
    return GridAssistLineUtils.getAssistLinesAndSignsByActivePoint(params.movingRect);
  }
}
