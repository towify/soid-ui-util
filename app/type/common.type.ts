/**
 *  @Author KaySaith
 *  @Date 10/31/20
 */
type Rgba = {
  red: number;
  green: number;
  blue: number;
  alpha: number;
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

type ComponentResizeType =
  | 'left'
  | 'right'
  | 'top'
  | 'bottom'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | 'auto';

export { Rgba, RectInfo, RegionInfo, ComponentResizeType };

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
    colors: ColorType[];
  };
};

export type ColorType = {
  // hex eg: #ff00ff
  hex: string;
  // opacity eg: 50
  opacity: number;
  // proportion eg: 51
  percent: number;
};

export const DefaultRect = {
  x: 0,
  y: 0,
  width: 0,
  height: 0
};
