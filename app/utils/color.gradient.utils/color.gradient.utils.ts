/*
 * @author allen
 * @data 2021/3/30 15:49
 */
import { ColorGradientType } from '../../type/common.type';
import { ColorUtils } from '../color.utils/color.utils';

export class ColorGradientUtils {
  static getColorGradientListCss(colorGradientList: ColorGradientType[]) {
    let cssString = '';
    colorGradientList.forEach((type, index) => {
      cssString += ColorGradientUtils.getColorGradientCss(type);
      if (index < colorGradientList.length - 1) {
        cssString += ',';
      }
    });
    return cssString;
  }

  static getColorGradientCss(colorGradient: ColorGradientType) {
    let colorGradientCss = colorGradient.shared.repeat ? 'repeating-' : '';
    if (colorGradient.linear) {
      colorGradientCss += `linear-gradient(${
        colorGradient.linear.angle ?? '180'
      }deg, `;
    } else if (colorGradient.radial) {
      colorGradientCss += `radial-gradient(circle ${
        colorGradient.radial.sizeType ?? ''
      }
      at ${colorGradient.radial.left ?? 50}% ${
        colorGradient.radial.top ?? 50
      }%, `;
    }
    colorGradient.shared.colors.forEach((colorInfo, index) => {
      colorGradientCss += `${ColorUtils.hexToRgba(
        colorInfo.hex,
        colorInfo.opacity
      )} ${colorInfo.percent}%`;
      if (index < colorGradient.shared.colors.length - 1) {
        colorGradientCss += ', ';
      } else {
        colorGradientCss += ')';
      }
    });
    return colorGradientCss;
  }

  static getAngleByPointInfo(params: {
    point: {
      x: number;
      y: number;
    };
    radius: number;
    pointRadius: number;
  }): number {
    const positionX = params.point.x - params.radius + params.pointRadius;
    const positionY = params.point.y - params.radius + params.pointRadius;
    if (positionX === 0 && positionY === 0) {
      return 0;
    }
    const cosValue =
      (0 - positionY) / Math.sqrt(positionX ** 2 + positionY ** 2);
    let currentAngle = (Math.acos(cosValue) * 180) / Math.PI;
    if (positionX < 0) {
      currentAngle = 360 - currentAngle;
    }
    if (currentAngle < 0) {
      currentAngle += 360;
    }
    return Math.round(currentAngle);
  }

  static getPointByAngleInfo(params: {
    angle: number;
    radius: number;
    pointRadius: number;
    offset: number;
  }): {
    x: number;
    y: number;
  } {
    const minRadius = params.radius - params.pointRadius - params.offset;
    const positionX =
      params.radius -
      params.pointRadius +
      minRadius * Math.sin((params.angle * Math.PI) / 180);
    const positionY =
      params.radius -
      params.pointRadius -
      minRadius * Math.cos((params.angle * Math.PI) / 180);
    return {
      x: parseFloat(positionX.toFixed(2)),
      y: parseFloat(positionY.toFixed(2))
    };
  }

  static getAlignPointByPointInfo(params: {
    point: {
      x: number;
      y: number;
    };
    radius: number;
    pointRadius: number;
    offset: number;
  }): { x: number; y: number } {
    const minRadius = params.radius - params.pointRadius - params.offset;
    const positionOffset = params.radius - params.pointRadius;
    const baseCenterX = params.point.x - positionOffset;
    const baseCenterY = params.point.y - positionOffset;
    const baseCenterRadius = Math.sqrt(
      baseCenterX * baseCenterX + baseCenterY * baseCenterY
    );
    const alignX =
      (minRadius / baseCenterRadius) * baseCenterX + positionOffset;
    const alignY =
      (minRadius / baseCenterRadius) * baseCenterY + positionOffset;
    return {
      x: alignX,
      y: alignY
    };
  }
}
