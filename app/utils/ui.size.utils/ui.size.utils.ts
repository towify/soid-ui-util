/*
 * @author allen
 * @data 2021/1/22 11:37
 */
import { SizeUnit, UISize } from '@towify/common-values';
import { ErrorUtils } from '../error.utils/error.utils';
import { NumberUtils } from '../number.utils/number.utils';

export class UISizeUtils {
  static getValidRenderSizeByComparing(params: {
    min: UISize;
    max: UISize;
    origin: UISize;
    parentSizeValue?: number;
  }): UISize {
    let originValue = UISizeUtils.convertUISizeToNumber(
      params.origin,
      params.parentSizeValue,
      false
    );
    originValue = originValue < 0 ? 0 : originValue;
    const minValue =
      params.max.unit === SizeUnit.Unset ||
      params.max.unit === SizeUnit.Auto ||
      params.max.unit === SizeUnit.Fit
        ? Number.MIN_VALUE
        : UISizeUtils.convertUISizeToNumber(params.min, params.parentSizeValue, false);
    const maxValue =
      params.max.unit === SizeUnit.Unset ||
      params.max.unit === SizeUnit.Auto ||
      params.max.unit === SizeUnit.Fit
        ? Number.MAX_VALUE
        : UISizeUtils.convertUISizeToNumber(params.max, params.parentSizeValue, false);
    if (originValue < minValue) return params.min;
    return originValue < maxValue ? params.origin : params.max;
  }

  static convertUISizeToNumber(sizeInfo: UISize, maxValue?: number, isAlert = true): number {
    let valueNumber = sizeInfo.value;
    if (sizeInfo.unit === SizeUnit.Auto) {
      return 0;
    }
    if (sizeInfo.unit === SizeUnit.Unset) {
      return 0;
    }
    if (sizeInfo.unit === SizeUnit.Fit) {
      return valueNumber;
    }
    if (sizeInfo.unit === SizeUnit.Percent) {
      valueNumber = ((maxValue ?? 0) * valueNumber) / 100;
      if (!maxValue && isAlert) {
        ErrorUtils.GridError('Value unit is percent and parent value is undefined');
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
    if (params.unit === SizeUnit.Percent) {
      value = parseFloat(((params.valueNumber / (params.maxValue ?? 1)) * 100).toFixed(2));
      if (value > 99.85 && value < 100.15) {
        value = 100;
      }
    }
    if (
      params.unit === SizeUnit.Unset ||
      params.unit === SizeUnit.Fit ||
      params.unit === SizeUnit.Auto
    ) {
      value = 0;
    }
    if (params.unit === SizeUnit.PX) {
      value = NumberUtils.parseViewNumber(value);
    }
    return {
      value,
      unit: params.unit
    };
  }

  static convertUISizeWithParentValue(params: {
    sizeInfo: UISize;
    oldParentValue: number;
    newParentValue: number;
  }): UISize {
    if (
      params.sizeInfo.unit === SizeUnit.Unset ||
      params.sizeInfo.unit === SizeUnit.Auto ||
      params.sizeInfo.unit === SizeUnit.Fit
    ) {
      return params.sizeInfo;
    }
    let value = params.sizeInfo.value;
    if (params.sizeInfo.unit === SizeUnit.Percent) {
      value = parseFloat(
        ((params.oldParentValue * params.sizeInfo.value) / params.newParentValue).toFixed(2)
      );
      if (value > 99.85 && value < 100.15) {
        value = 100;
      }
    }
    return {
      value,
      unit: params.sizeInfo.unit
    };
  }

  static getSizeInfoByNumberValue(params: {
    newValue: number;
    oldSizeInfo: UISize;
    oldValue: number;
  }): UISize {
    if (
      params.oldSizeInfo.unit === SizeUnit.Unset ||
      params.oldSizeInfo.unit === SizeUnit.Auto ||
      params.oldSizeInfo.unit === SizeUnit.Fit
    ) {
      return params.oldSizeInfo;
    }
    let value = parseFloat(params.newValue.toFixed(2));
    if (value === 0 || params.oldValue === 0) {
      return {
        value,
        unit: SizeUnit.PX
      };
    }
    if (params.oldSizeInfo.unit === SizeUnit.Percent) {
      value = parseFloat(
        ((params.oldSizeInfo.value * params.newValue) / params.oldValue).toFixed(2)
      );
    }
    return {
      value,
      unit: params.oldSizeInfo.unit
    };
  }

  static checkSizeInfoIsAuto(sizeInfo?: UISize): boolean {
    if (!sizeInfo) return false;
    return sizeInfo.unit === SizeUnit.Auto;
  }

  static increaseUISizeValue(params: {
    sizeInfo: UISize;
    increaseValue: number;
    origin?: number;
    maxValue?: number;
  }): UISize {
    if (
      params.sizeInfo.unit === SizeUnit.Auto ||
      params.sizeInfo.unit === SizeUnit.Unset ||
      params.sizeInfo.unit === SizeUnit.Fit
    ) {
      if (params.origin === undefined) return params.sizeInfo;
      return {
        value: parseFloat((params.origin + params.increaseValue).toFixed(1)),
        unit: SizeUnit.PX
      };
    }
    const changeSizeInfo = UISizeUtils.convertNumberToUISize({
      valueNumber: params.increaseValue,
      unit: params.sizeInfo.unit,
      maxValue: params.maxValue
    });
    return {
      value: parseFloat(
        (params.sizeInfo.value + changeSizeInfo.value).toFixed(
          params.sizeInfo.unit === SizeUnit.PX ? 1 : 2
        )
      ),
      unit: params.sizeInfo.unit
    };
  }
}
