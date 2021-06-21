/*
 * @author allen
 * @data 2020/12/4 16:25
 */
export class NumberUtils {
  static parseViewNumber(value: number): number {
    const intValue = Math.floor(value);
    const floatValue = parseFloat(value.toFixed(2));
    let radix = floatValue - intValue;
    if (radix > 0.6) {
      radix = 1;
    } else if (radix > 0.2) {
      radix = 0.5;
    } else {
      radix = 0;
    }
    return intValue + radix;
  }

  static convertValueInRange(percent: number, max = 100, min = 0): number {
    if (percent > max) {
      percent = max;
    }
    if (percent < min) {
      percent = min;
    }
    return percent;
  }
}
