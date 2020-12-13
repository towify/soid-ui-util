/*
 * @author allen
 * @data 2020/12/9 15:27
 */
import {
  CustomGrid,
  GridArea,
  GridGap,
  SizeUnit,
  SpacingMargin,
  SpacingPadding
} from 'towify-editor-common-values';
import { SizeInfo } from './common.type';
import { RectModel } from '../model/rect.model';

type LayerInfo = {
  id: string;
  parentId: string;
  order: number;
  gridArea: GridArea;
  size: SizeInfo;
  margin: SpacingMargin;
  grid?: CustomGrid;
  gap?: GridGap;
  padding?: SpacingPadding;
  border?: SpacingPadding;
};

type RangeInfo = {
  id: string;
  parentId: string;
  childIds: string[];
  ancestorIds: string[];
  order: number;
  rect: RectModel;
  size: SizeInfo;
  margin: SpacingMargin;
  gap: GridGap;
  padding: SpacingPadding;
  border: SpacingPadding;
  gridArea: GridArea;
  grid: CustomGrid;
};

type SignInfo = {
  x: number;
  y: number;
  sign: string;
};

type AlignOffsetInfo = {
  x: number;
  y: number;
};

type PointInfo = {
  x: number;
  y: number;
};

export { LayerInfo, RangeInfo, PointInfo, SignInfo, AlignOffsetInfo };

const AlignDefaultOffset = {
  x: 0,
  y: 0
};

const DefaultSpacingPadding = {
  left: { value: 0, unit: SizeUnit.PX },
  right: { value: 0, unit: SizeUnit.PX },
  top: { value: 0, unit: SizeUnit.PX },
  bottom: { value: 0, unit: SizeUnit.PX }
};

const DefaultGridGap = {
  row: { value: 0, unit: SizeUnit.PX },
  column: { value: 0, unit: SizeUnit.PX }
};

const DefaultGrid = {
  row: [],
  column: []
};

export {
  AlignDefaultOffset,
  DefaultSpacingPadding,
  DefaultGridGap,
  DefaultGrid
};
