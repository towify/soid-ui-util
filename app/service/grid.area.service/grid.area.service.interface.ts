/*
 * @author allen
 * @data 2020/11/12 15:42
 */
import { GridAreaInfo, PaddingInfo, RectInfo } from '../../type/common.type';

export interface GridAreaServiceInterface {
  /**
   * @param width Window width
   * @param height Window height
   * 设置窗口 高宽
   */
  setWindowSize(width: number, height: number): GridAreaServiceInterface;

  /**
   * @param width Window width
   * @param height Window height
   * 设置 parent grid size
   */
  setParentGridSize(width: number, height: number): GridAreaServiceInterface;

  /**
   * @param info:  grid row info， eg: [{ value: 20, uint: 'px'}, { value: 10, uint: 'vw'}]
   * 设置 grid row info
   */
  setParentGridRowInfo(
    info: { value: number; unit: string }[]
  ): GridAreaServiceInterface;

  /**
   * @param info:  grid column info eg: [{ value: 20, uint: 'px'}, { value: 10, uint: 'vw'}]
   * 设置 grid column info
   */
  setParentGridColumnInfo(
    info: { value: number; unit: string }[]
  ): GridAreaServiceInterface;

  /**
   * @param row: grid row info eg: [{ value: 20, uint: 'px'}, { value: 10, uint: 'vw'}]
   * @param column: grid column info eg: [{ value: 20, uint: 'px'}, { value: 10, uint: 'vw'}]
   * 设置 grid column info
   */
  setParentGridInfo(
    row: { value: number; unit: string }[],
    column: { value: number; unit: string }[]
  ): GridAreaServiceInterface;

  /**
   * @param row: grid row count
   * @param column: grid column count
   * 设置 grid row \ column count
   */
  setParentGridCount(row: number, column: number): GridAreaServiceInterface;

  /**
   * @param info grid padding info， eg: { left: '20px', top: '10%', right: '10vw', bottom: '20vh' };
   * 设置 grid padding
   */
  setParentGridPaddingInfo(info: PaddingInfo): GridAreaServiceInterface;

  /**
   * @param row: grid row gap
   * @param column: grid column gap
   * 设置 grid row \ column gap
   */
  setParentGridGap(
    row: { value: number; unit: string },
    column: { value: number; unit: string }
  ): GridAreaServiceInterface;

  /**
   * @param rect dropped rect
   * 设置 dropped rect
   */
  setDroppedRect(rect: RectInfo): GridAreaServiceInterface;

  /**
   * @description 根据 dropped rect 返回 drop 在 grid 中的 info
   * @return
   * gridArea: grid area info, eg: [1, 1, 2, 2]
   * marginLeft: dropped marginLeft
   * marginTop: dropped marginTop
   */
  getDroppedGridInfo(): {
    gridArea: GridAreaInfo;
    marginLeft: number;
    marginTop: number;
  };

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
  setChildrenGridInfo(
    childrenInfo: {
      id: string;
      gridArea: GridAreaInfo;
      marginLeft: number;
      marginTop: number;
      width: number;
      height: number;
    }[]
  ): GridAreaServiceInterface;

  /**
   * @description 更新 grid rect / row info / column info / padding 后重新校准 children 的 grid info
   */
  adjustChildrenGridInfo(): {
    id: string;
    gridArea: GridAreaInfo;
    marginLeft: number;
    marginTop: number;
  }[];

  /**
   * @param showBord: 是否显示 border, 默认为false
   * 返回grid
   */
  getGridLineList(
    isShowBorder: boolean
  ): { fromX: number; fromY: number; toX: number; toY: number }[];
}
