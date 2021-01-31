/*
 * @author allen
 * @data 2021/1/22 11:37
 */
import { Mark, SizeUnit, UISize } from 'towify-editor-common-values';
import { ErrorUtils } from '../error.utils/error.utils';
import { WindowUtils } from '../window.utils/window.utils';
import { NumberUtils } from '../number.utils/number.utils';

export class UISizeUtils {

  static getValidRenderSizeByComparing(params: {
    min: UISize,
    max: UISize,
    origin: UISize,
    parentSizeValue?: number
  }): UISize {
    const minValue = UISizeUtils.convertSizeInfoToNumber(params.min, params.parentSizeValue);
    const maxValue = UISizeUtils.convertSizeInfoToNumber(params.max, params.parentSizeValue);
    const originValue = UISizeUtils.convertSizeInfoToNumber(params.origin, params.parentSizeValue);
    if (originValue > minValue) {
      if (maxValue < minValue || originValue < maxValue) {
        return params.origin;
      }
      return params.max;
    }
    return params.min;
  }

  static convertSizeInfoToNumber(sizeInfo: UISize, maxValue?: number): number {
    let valueNumber = sizeInfo.value;
    if (valueNumber === Mark.Auto) {
      return 0;
    }
    if (valueNumber === Mark.Unset) {
      return 0;
    }
    if (sizeInfo.unit === SizeUnit.VW) {
      valueNumber = ((WindowUtils.WindowSize?.width ?? 0) * valueNumber) / 100;
      if (!WindowUtils.WindowSize?.width) {
        ErrorUtils.GridError('Window size is undefined');
      }
    }
    if (sizeInfo.unit === SizeUnit.VH) {
      valueNumber = ((WindowUtils.WindowSize?.height ?? 0) * valueNumber) / 100;
      if (!WindowUtils.WindowSize?.height) {
        ErrorUtils.GridError('Window size is undefined');
      }
    }
    if (sizeInfo.unit === '%') {
      valueNumber = ((maxValue ?? 0) * valueNumber) / 100;
      if (!maxValue) {
        ErrorUtils.GridError('Parent size is undefined');
      }
    }
    return valueNumber;
  }

  static convertNumberToSizeInfo(params: {
    valueNumber: number;
    unit: SizeUnit;
    windowSize?: { width: number; height: number };
    maxValue?: number;
  }): UISize {
    let value = params.valueNumber;
    if (params.unit === SizeUnit.VW) {
      value = (params.valueNumber / (params.windowSize?.width ?? 1)) * 100;
      if (!params.windowSize?.width) {
        ErrorUtils.GridError('Window size is undefined');
      }
    }
    if (params.unit === SizeUnit.VH) {
      value = (params.valueNumber / (params.windowSize?.height ?? 1)) * 100;
      if (!params.windowSize?.height) {
        ErrorUtils.GridError('Window size is undefined');
      }
    }
    if (params.unit === SizeUnit.Percent) {
      value = (params.valueNumber / (params.maxValue ?? 1)) * 100;
    }
    if (params.unit === SizeUnit.PX) {
      return {
        value: NumberUtils.parseViewNumber(value),
        unit: params.unit
      };
    }
    return {
      value: parseFloat(value.toFixed(1)),
      unit: params.unit
    };
  }

  static convertSizeToParent(params: {
    sizeInfo: UISize,
    oldParentValue: number,
    newParentValue: number
  }): UISize {
    let value = params.sizeInfo.value;
    if (params.sizeInfo.unit === SizeUnit.Percent) {
      value = parseFloat((params.oldParentValue * params.sizeInfo.value / params.newParentValue).toFixed(1));
    }
    return {
      value,
      unit: params.sizeInfo.unit
    };
  }

}
