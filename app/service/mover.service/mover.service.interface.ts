/*
 * @author allen
 * @data 2020/12/9 14:36
 */
import { LayerInfo, SignInfo } from '../../type/interact.type';
import { LineInfo } from '../../type/common.type';

export interface MoverServiceInterface {
  /**
   * @param width Window width
   * @param height Window height
   * 设置窗口 高宽
   */
  setWindowSize(width: number, height: number): MoverServiceInterface;

  /**
   * @param info: 注入 Page Layers
   */
  injectStructuredLayers(info: LayerInfo[]): MoverServiceInterface;

  /**
   * @param id: 开始移动 Layer 的id
   */
  startMovingLayerById(id: string): MoverServiceInterface;

  /**
   * @param offset: 移动 Layer 的偏移量
   */
  movingLayer(offset: { x: number; y: number }): MoverServiceInterface;

  /**
   * @description 结束移动 Layer
   */
  stopMovingLayer(): MoverServiceInterface;

  /**
   * @description 获取 assist lines 的信息
   */
  getAssistLinesAndSigns(): {
    lines: LineInfo[];
    signs: SignInfo[];
  };
}
