/*
 * @author allen
 * @data 2020/11/12 15:42
 */
import { PaddingInfo } from '../../type/common.type';

export interface GridAreaServiceInterface {
  /**
   * @param width Window width
   * @param height Window height
   * 设置窗口 高宽
   */
  setWindowSize(width: number, height: number): GridAreaServiceInterface;

  /**
   * @param rect grid rect
   * 设置 parent grid rect
   */
  setGridRect(rect: DOMRect): GridAreaServiceInterface;

  /**
   * @param info grid row info， eg: [{ value: 20, uint: 'px'}, { value: 10, uint: 'vw'}]
   * 设置 grid row info
   */
  setGridRowInfo(info: { value: number, unit: string }[]): GridAreaServiceInterface;

  /**
   * @param info grid column info eg: [{ value: 20, uint: 'px'}, { value: 10, uint: 'vw'}]
   * 设置 grid column info
   */
  setGridColumnInfo(info: { value: number, unit: string }[]): GridAreaServiceInterface;

  /**
   * @param 设置 grid row \ column count
   */
  setGridCount(row: number, column: number): GridAreaServiceInterface;

  /**
   * @param padding grid padding info， eg: { left: '20px', top: '10%', right: '10vw', bottom: '20vh' };
   * 设置 grid padding
   */
  setGridPaddingInfo(padding: PaddingInfo): GridAreaServiceInterface

  /**
   * @param rect dropped rect
   * 设置 dropped rect
   */
  setDroppedRect(rect: DOMRect): GridAreaServiceInterface;

  /**
   * @description 根据 dropped rect 返回 drop 在 grid 中的 info
   * @return
   * gridArea: grid area info, eg: [1, 1, 2, 2]
   * marginLeft: dropped marginLeft
   * marginTop: dropped marginTop
   */
  getDroppedGridInfo(): {
    gridArea: number[];
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
  setChildrenRectInfo(
    childrenInfo: {
      id: string;
      gridArea: number[];
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
    gridArea: number[];
    marginLeft: number;
    marginTop: number
  }[];
}
