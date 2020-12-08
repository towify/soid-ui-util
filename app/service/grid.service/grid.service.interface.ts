/*
 * @author allen
 * @data 2020/11/23 22:15
 */
import { GridArea, SpacingPadding, UISize } from 'towify-editor-common-values';
import {
  GridChildInfo,
  RectInfo,
  SizeInfo
} from '../../type/common.type';

export interface GridServiceInterface {
  /**
   * @param width Window width
   * @param height Window height
   * 设置窗口 高宽
   */
  setWindowSize(width: number, height: number): GridServiceInterface;

  /**
   * @param width Window width
   * @param height Window height
   * 设置 parent grid size
   */
  setGridSize(width: number, height: number): GridServiceInterface;

  /**
   * @param info:  grid row info， eg: [{ value: 20, uint: 'px'}, { value: 10, uint: 'vw'}]
   * 设置 parent grid row info
   */
  setGridRowInfo(info: UISize[]): GridServiceInterface;

  /**
   * @param info:  grid column info eg: [{ value: 20, uint: 'px'}, { value: 10, uint: 'vw'}]
   * 设置 parent grid column info
   */
  setGridColumnInfo(info: UISize[]): GridServiceInterface;

  /**
   * @param info
   */
  setGridInfo(info: {
    row: UISize[],
    column: UISize[]
  }): GridServiceInterface;

  /**
   * @param params: grid row count
   * 设置 parent grid row \ column count
   */
  setGridCount(params: {
    row: number;
    column: number;
    gap?: {
      row: UISize,
      column: UISize
    }
  }): GridServiceInterface;

  /**
   * @param info grid padding info， eg: { left: '20px', top: '10%', right: '10vw', bottom: '20vh' };
   * 设置 parent grid padding
   */
  setGridPaddingInfo(info: SpacingPadding): GridServiceInterface;

  /**
   * @param info grid border info， eg: { left: '20px', top: '10%', right: '10vw', bottom: '20vh' };
   * 设置 parent grid border
   */
  setGridBorderInfo(info: SpacingPadding): GridServiceInterface;

  /**
   * @param gap
   */
  setGridGap(gap: {
    row: UISize,
    column: UISize
  }): GridServiceInterface;

  /**
   * @description 设置 grid children rect
   * @param childrenInfo
   * id: child id
   * gridArea: child grid area, eg: [1,1,2,2]
   * marginLeft: child marginLeft
   * marginTop: child marginTop
   * width: child width
   * height: child height
   */
  setChildrenGridInfo(childrenInfo: GridChildInfo[]): GridServiceInterface;

  /**
   * @description delete grid child
   * @param childId delete grid child id
   */
  deleteChildByIdAndGetParentGridChildrenUpdateStatus(childId: string): boolean;

  /**
   * @description update grid child
   * @param child grid child
   */
  updateChildInfoAndGetParentGridChildrenUpdateStatus(
    child: GridChildInfo
  ): boolean;

  /**
   * @param dropped dropped rect
   * 设置 parent dropped rect
   */
  setDroppedInfo(dropped: {
    id: string;
    x: number;
    y: number;
    size: SizeInfo;
    gridArea?: GridArea;
  }): {
    info: GridChildInfo;
    needUpdateGridChildren: boolean;
  };

  /**
   * @description 校准 grid children info， 当更新 grid row / column info 后校准 children 的 grid area,  grid row / column info 设置为auto的将重置为不没有被挤压的状态
   */
  adjustChildrenAndResetAutoGridInfo(): GridChildInfo[];

  /**
   * @description 更新 grid children info, 当更新 grid rect / padding / gap 移动某个 child 之后，更新所有 child 的 grid info， 不会修改 grid area 只会调整 margin 的数值
   */
  getModifiedChildrenGirdInfo(): GridChildInfo[];

  /**
   * @description 返回 grid item line info
   */
  getGridLines(): { fromX: number; fromY: number; toX: number; toY: number }[];

  /**
   * @description 返回 grid gap area and line info
   */
  getGridGapAreaAndLines(
    lineSpace: number
  ): {
    area: RectInfo[];
    lines: { fromX: number; fromY: number; toX: number; toY: number }[];
  };

  /**
   * @description 返回 grid padding area and line info
   */
  getGridPaddingAreaAndLines(
    lineSpace: number
  ): {
    area: RectInfo[];
    lines: { fromX: number; fromY: number; toX: number; toY: number }[];
  };
}
