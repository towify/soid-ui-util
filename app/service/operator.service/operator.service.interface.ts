/*
 * @author allen
 * @data 2020/12/6 16:02
 */
import { RectInfo } from '../../type/common.type';

export interface OperatorServiceInterface {
  /**
   * @description 设置最小距离
   */
  minDistance: number;

  /**
   * @param rect: 设置 parent rect
   */
  setParentRect(rect: RectInfo): OperatorServiceInterface;

  /**
   * @param rectList: 设置 page container rect list
   */
  setPageContainerRectList(rectList: RectInfo[]): OperatorServiceInterface;

  /**
   * @param width: operator width;
   * @param height: operator height;
   */
  setOperatorSize(width: number, height: number): OperatorServiceInterface;

  /**
   * @description 获取计算的最小最优 operator rect 位置
   */
  getOperatorRect(): RectInfo;
}
