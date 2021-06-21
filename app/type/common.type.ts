/**
 *  @Author KaySaith
 *  @Date 10/31/20
 */
import {
  GridArea,
  SizeUnit,
  SpacingMargin,
  UISize
} from 'towify-editor-common-values';

type Rgba = {
  red: number;
  green: number;
  blue: number;
  alpha: number;
};

type SizeInfo = {
  [key: string]: UISize;
  width: UISize;
  minWidth: UISize;
  maxWidth: UISize;
  height: UISize;
  minHeight: UISize;
  maxHeight: UISize;
};

type PlaceSelfInfo = {
  // 水平
  justifySelf: string;
  // 垂直
  alignSelf: string;
};

type GridChildInfo = {
  id: string;
  gridArea: GridArea;
  margin: SpacingMargin;
  placeSelf: PlaceSelfInfo;
  size: SizeInfo;
  rect?: RectInfo;
  parentRect?: RectInfo;
  isFullParent?: boolean;
};

type RectInfo = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type RegionInfo = {
  from: number;
  to: number;
};

type LineInfo = {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
};

type PaddingInfo = {
  left: number;
  right: number;
  top: number;
  bottom: number;
};

export {
  Rgba,
  RectInfo,
  GridChildInfo,
  SizeInfo,
  PlaceSelfInfo,
  RegionInfo,
  LineInfo,
  PaddingInfo
};

export type RadialColorGradientSizeType =
  | 'closest-side'
  | 'farthest-side'
  | 'closest-corner'
  | 'farthest-corner';

export type ColorGradientType = {
  linear?: {
    angle: number;
  };
  radial?: {
    left: number;
    top: number;
    sizeType: RadialColorGradientSizeType;
  };
  shared: {
    repeat: boolean;
    colors: {
      // hex eg: #ff00ff
      hex: string;
      // opacity eg: 50
      opacity: number;
      // proportion eg: 51
      percent: number;
    }[];
  };
};

export const DefaultRect = {
  x: 0,
  y: 0,
  width: 0,
  height: 0
};

export const UnsetUnit = {
  value: 0,
  unit: SizeUnit.Unset
};

export enum GridLineType {
  Horizontal = 'horizontal',
  Vertical = 'vertical'
}
