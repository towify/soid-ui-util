/*
 * @author allen
 * @data 2020/11/23 22:15
 */
import {
  CustomGrid,
  GridArea,
  GridGap,
  SpacingPadding,
  UISize
} from 'towify-editor-common-values';
import {
  GridChildInfo,
  LineInfo,
  RectInfo,
  SizeInfo
} from '../../type/common.type';
import { AlignOffsetInfo, SignInfo } from '../../type/interact.type';

export interface GridServiceInterface {
  /**
   * @param width Window width
   * @param height Window height
   * 设置窗口 高宽
   */
  setWindowSize(width: number, height: number): GridServiceInterface;

  /**
   * @param rect: grid rect
   * @param scale: grid scale
   * 设置 parent grid size
   */
  setGridRect(rect: RectInfo, scale?: number): GridServiceInterface;

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
  setGridInfo(info: CustomGrid): GridServiceInterface;

  /**
   * @param params: grid row count
   * 设置 parent grid row \ column count
   */
  setGridCount(params: {
    row: number;
    column: number;
    gap?: GridGap;
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
  setGridGap(gap: GridGap): GridServiceInterface;

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
   * @param needScale 是否需要计算缩放
   */
  getGridLines(needScale?: boolean): LineInfo[];

  /**
   * @description 返回 grid gap area and line info
   */
  getGridGapAreaAndLines(
    lineSpace: number,
    needScale?: boolean
  ): {
    area: RectInfo[];
    lines: LineInfo[];
  };

  /**
   * @description 返回 grid padding area and line info
   */
  getGridPaddingAreaAndLines(
    lineSpace: number,
    needScale?: boolean
  ): {
    area: RectInfo[];
    lines: LineInfo[];
  };

  /**
   * @param id: 开始移动 Layer 的id
   */
  startMovingChildById(id: string): GridServiceInterface;

  /**
   * @param offset: 移动 Layer 的偏移量
   */
  movingChild(offset: { x: number; y: number }): GridServiceInterface;

  /**
   * @description 结束移动 Layer
   */
  stopMovingChild(): GridServiceInterface;

  /**
   * @description 获取 assist lines 的信息
   */
  getAlignAndAssistLineInfo(
    needScale?: boolean,
    maxActiveLength?: number
  ): {
    assistLines: LineInfo[];
    assistSigns: SignInfo[];
    alignLines: LineInfo[];
    offset: AlignOffsetInfo;
  };
}
