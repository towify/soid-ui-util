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
   * @param info grid row info， eg: ['1fr', '20%']
   * 设置 grid row info
   */
  setGridRowInfo(info: string[]): GridAreaServiceInterface;

  /**
   * @param info grid column info， eg: ['1fr', '20%']
   * 设置 grid column info
   */
  setGridColumnInfo(info: string[]): GridAreaServiceInterface;

  /**
   * @param padding grid padding info， eg: { left: '20px', top: '10%', right: '10vw', bottom: '20vh' };
   * 设置 grid padding
   */
  setGridPaddingInfo(padding: PaddingInfo): GridAreaServiceInterface;

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

  adjustChildrenRectInfo(): {
    id: string;
    gridArea: number[];
    marginLeft: number;
    marginTop: number;
    width: number;
    height: number;
  }[];
}
