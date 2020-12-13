/*
 * @author allen
 * @data 2020/12/9 14:36
 */
import { LayerInfo, SignInfo } from '../../type/interact.type';
import { LineInfo } from '../../type/common.type';

export interface MoverServiceInterface {
  injectStructuredLayers(info: LayerInfo[]): MoverServiceInterface;

  startMovingLayerById(id: string): MoverServiceInterface;

  movingLayer(offset: { x: number; y: number }): MoverServiceInterface;

  stopMovingLayer(): MoverServiceInterface;

  getAssistLinesAndSigns(): {
    lines: LineInfo[];
    signs: SignInfo[];
  };
}
