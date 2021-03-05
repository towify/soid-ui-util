/*
 * @author allen
 * @data 2021/1/22 11:37
 */
import { SizeUnit, UISize } from 'towify-editor-common-values';
import { ErrorUtils } from '../error.utils/error.utils';
import { NumberUtils } from '../number.utils/number.utils';

export class UISizeUtils {
  static getValidRenderSizeByComparing(params: {
    min: UISize;
    max: UISize;
    origin: UISize;
    parentSizeValue?: number;
  }): UISize {
    const originValue = UISizeUtils.convertUISizeToNumber(
      params.origin,
      params.parentSizeValue
    );
    if (
      params.min.unit !== SizeUnit.Auto &&
      params.min.unit !== SizeUnit.Unset
    ) {
      const minValue = UISizeUtils.convertUISizeToNumber(
        params.min,
        params.parentSizeValue
      );
      if (originValue > minValue) {
        if (
          params.max.unit !== SizeUnit.Unset &&
          params.max.unit !== SizeUnit.Auto
        ) {
          const maxValue = UISizeUtils.convertUISizeToNumber(
            params.max,
            params.parentSizeValue
          );
          if (maxValue < minValue || originValue < maxValue) {
            return params.origin;
          }
          return params.max;
        }
        return params.origin;
      }
      return params.min;
    }
    if (
      params.max.unit !== SizeUnit.Unset &&
      params.max.unit !== SizeUnit.Auto
    ) {
      const maxValue = UISizeUtils.convertUISizeToNumber(
        params.max,
        params.parentSizeValue
      );
      if (originValue < maxValue) {
        return params.origin;
      }
      return params.max;
    }
    return params.origin;
  }

  static convertUISizeToNumber(sizeInfo: UISize, maxValue?: number): number {
    let valueNumber = sizeInfo.value;
    if (sizeInfo.unit === SizeUnit.Auto) {
      return 0;
    }
    if (sizeInfo.unit === SizeUnit.Unset) {
      return 0;
    }
    if (sizeInfo.unit === SizeUnit.Percent) {
      valueNumber = ((maxValue ?? 0) * valueNumber) / 100;
      if (!maxValue) {
        ErrorUtils.GridError('Parent size is undefined');
      }
    }
    return valueNumber;
  }

  static convertNumberToUISize(params: {
    valueNumber: number;
    unit: SizeUnit;
    maxValue?: number;
  }): UISize {
    let value = params.valueNumber;
    let unit = params.unit;
    if (params.unit === SizeUnit.Percent) {
      value = parseFloat(
        ((params.valueNumber / (params.maxValue ?? 1)) * 100).toFixed(1)
      );
      unit = SizeUnit.Percent;
    }
    if (params.unit === SizeUnit.PX) {
      value = NumberUtils.parseViewNumber(value);
      unit = SizeUnit.PX;
    }
    if (params.unit === SizeUnit.Fit) {
      value = NumberUtils.parseViewNumber(value);
      unit = SizeUnit.Fit;
    }
    return {
      value,
      unit
    };
  }

  static convertUISizeWithParentValue(params: {
    sizeInfo: UISize;
    oldParentValue: number;
    newParentValue: number;
  }): UISize {
    if (
      params.sizeInfo.unit === SizeUnit.Unset ||
      params.sizeInfo.unit === SizeUnit.Auto
    ) {
      return params.sizeInfo;
    }
    let value = params.sizeInfo.value;
    if (params.sizeInfo.unit === SizeUnit.Percent) {
      value = parseFloat(
        (
          (params.oldParentValue * params.sizeInfo.value) /
          params.newParentValue
        ).toFixed(1)
      );
    }
    return {
      value,
      unit: params.sizeInfo.unit
    };
  }
}
