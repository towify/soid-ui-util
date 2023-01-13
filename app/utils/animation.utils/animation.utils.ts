/*
 * @Author: allen
 * @Date: 2022/5/29
 */

import type { AnimationContentType, AnimationGroupType, DslAnimationType } from '@towify-types/dsl';
import { AnimationEnum } from '@towify-types/dsl';
import { AnimationGroupInfoList, AnimationKeyFrames, AnimationKeyFrameTransform } from '../../type/animation.type';
import { SizeUnit } from '@towify/common-values';
import { NumberUtils } from 'soid-data/util/number.utils';

export class AnimationUtils {
  public static getContentKeyFrames(content: AnimationContentType): AnimationKeyFrames {
    const startKeyFrame: AnimationKeyFrameTransform = {};
    const endKeyFrame: AnimationKeyFrameTransform = {};
    switch (content.type) {
      case AnimationEnum.Action.Skew: {
        startKeyFrame.skew ??= {};
        endKeyFrame.skew ??= {};
        switch (content.method) {
          case AnimationEnum.AxisMethod.X: {
            startKeyFrame.skew.x = <number>content.value.start.value;
            endKeyFrame.skew.x = <number>content.value.end.value;
            break;
          }
          case AnimationEnum.AxisMethod.Y: {
            startKeyFrame.skew.y = <number>content.value.start.value;
            endKeyFrame.skew.y = <number>content.value.end.value;
            break;
          }
          default:
            break;
        }
        break;
      }
      case AnimationEnum.Action.Translate: {
        startKeyFrame.translate ??= {};
        endKeyFrame.translate ??= {};
        switch (content.method) {
          case AnimationEnum.AxisMethod.X: {
            startKeyFrame.translate.x = <{ value: number; unit: SizeUnit.PX | SizeUnit.Percent }>content.value.start;
            endKeyFrame.translate.x = <{ value: number; unit: SizeUnit.PX | SizeUnit.Percent }>content.value.end;
            break;
          }
          case AnimationEnum.AxisMethod.Y: {
            startKeyFrame.translate.y = <{ value: number; unit: SizeUnit }>content.value.start;
            endKeyFrame.translate.y = <{ value: number; unit: SizeUnit }>content.value.end;
            break;
          }
          case AnimationEnum.AxisMethod.Z: {
            startKeyFrame.translate.z = <{ value: number; unit: SizeUnit }>this.getValue(content.value.start);
            endKeyFrame.translate.z = <{ value: number; unit: SizeUnit }>this.getValue(content.value.end);
            break;
          }
          default:
            break;
        }
        break;
      }
      case AnimationEnum.Action.Scale: {
        startKeyFrame.scale ??= {
          x: <number>content.value.start.value,
          y: <number>content.value.start.value
        };
        endKeyFrame.scale ??= {
          x: <number>content.value.end.value,
          y: <number>content.value.end.value
        };
        break;
      }
      case AnimationEnum.Action.Opacity: {
        startKeyFrame.opacity = <number>content.value.start.value;
        endKeyFrame.opacity = <number>content.value.end.value;
        break;
      }
      case AnimationEnum.Action.Rotate: {
        if (!content.rotated3d) break;
        // Rotate 的 Perspective 只在 X Y 动画下生效
        startKeyFrame.rotation = {
          x: <number>content.rotated3d.x,
          y: <number>content.rotated3d.y,
          z: <number>content.rotated3d.z,
          angle: <number>content.value.start.value
        };
        endKeyFrame.rotation = {
          x: <number>content.rotated3d.x,
          y: <number>content.rotated3d.y,
          z: <number>content.rotated3d.z,
          angle: <number>content.value.end.value
        };
        break;
      }
      default:
        break;
    }
    if (content.method === AnimationEnum.AxisMethod.Z) {
      startKeyFrame.perspective = <{ value: number; unit: SizeUnit }>content.perspective;
      endKeyFrame.perspective = <{ value: number; unit: SizeUnit }>content.perspective;
    }
    return {
      0: startKeyFrame,
      100: endKeyFrame
    };
  }

  static getKeyFrameTransform(
    animationKeyFrames: AnimationKeyFrames,
    percent: number
  ): AnimationKeyFrameTransform | undefined {
    let endKeyFrame: AnimationKeyFrameTransform | undefined;
    let startKeyFrame: AnimationKeyFrameTransform | undefined;
    let endPercent = 100;
    let startPercent = 0;
    const frameKeysQueue = Object.keys(animationKeyFrames)
      .map(key => parseFloat(key))
      .sort((a, b) => (a > b ? 1 : -1));
    frameKeysQueue.some((key, index) => {
      if (percent * 100 <= key) {
        endPercent = key;
        endKeyFrame = animationKeyFrames![endPercent];
        if (index > 0) {
          startPercent = frameKeysQueue[index - 1];
          startKeyFrame = animationKeyFrames![startPercent];
        } else {
          startPercent = 0;
          if (key === 0) {
            startKeyFrame = animationKeyFrames![endPercent];
          } else {
            startKeyFrame = {};
          }
        }
        return true;
      }
      return false;
    });
    if (!endKeyFrame && !startKeyFrame) return undefined;
    let transformPercent = 0;
    if (endPercent !== startPercent) {
      transformPercent = (percent * 100 - startPercent) / (endPercent - startPercent);
    }
    const getTranslateValue = (
      endTranslate?: { value: number; unit: SizeUnit },
      startTranslate?: { value: number; unit: SizeUnit }
    ) => {
      if (!endTranslate && !startTranslate) return undefined;
      if (endTranslate && startTranslate && endTranslate.unit !== startTranslate.unit) {
        return {
          value: endTranslate.value * transformPercent,
          unit: endTranslate.unit
        };
      }
      return {
        value:
          (startTranslate?.value || 0) +
          ((endTranslate?.value || 0) - (startTranslate?.value || 0)) * transformPercent,
        unit: endTranslate?.unit || startTranslate?.unit || SizeUnit.PX
      };
    };
    return {
      translate:
        !endKeyFrame?.translate && !startKeyFrame?.translate
          ? undefined
          : {
            x: getTranslateValue(endKeyFrame?.translate?.x, startKeyFrame?.translate?.x),
            y: getTranslateValue(endKeyFrame?.translate?.y, startKeyFrame?.translate?.y),
            z: getTranslateValue(endKeyFrame?.translate?.z, startKeyFrame?.translate?.z)
          },
      scale:
        !endKeyFrame?.scale && !startKeyFrame?.scale
          ? undefined
          : {
            x:
              !endKeyFrame?.scale?.x && !startKeyFrame?.scale?.x
                ? undefined
                : (startKeyFrame?.scale?.x || 1) +
                ((endKeyFrame?.scale?.x || 1) - (startKeyFrame?.scale?.x || 1)) *
                transformPercent,
            y:
              !endKeyFrame?.scale?.y && !startKeyFrame?.scale?.y
                ? undefined
                : (startKeyFrame?.scale?.y || 1) +
                ((endKeyFrame?.scale?.y || 1) - (startKeyFrame?.scale?.y || 1)) *
                transformPercent,
            z:
              !endKeyFrame?.scale?.z && !startKeyFrame?.scale?.z
                ? undefined
                : (startKeyFrame?.scale?.z || 1) +
                ((endKeyFrame?.scale?.z || 1) - (startKeyFrame?.scale?.z || 1)) *
                transformPercent
          },
      rotation:
        !endKeyFrame?.rotation && !startKeyFrame?.rotation
          ? undefined
          : {
            x: endKeyFrame?.rotation?.x || startKeyFrame?.rotation?.x,
            y: endKeyFrame?.rotation?.y || startKeyFrame?.rotation?.y,
            z: endKeyFrame?.rotation?.z || startKeyFrame?.rotation?.z,
            angle:
              endKeyFrame?.rotation?.x === startKeyFrame?.rotation?.x &&
              endKeyFrame?.rotation?.y === startKeyFrame?.rotation?.y &&
              endKeyFrame?.rotation?.z === startKeyFrame?.rotation?.z
                ? (startKeyFrame?.rotation?.angle || 0) +
                ((endKeyFrame?.rotation?.angle || 0) - (startKeyFrame?.rotation?.angle || 0)) *
                transformPercent
                : (endKeyFrame?.rotation?.angle || 0) * transformPercent
          },
      skew:
        !endKeyFrame?.skew && !startKeyFrame?.skew
          ? undefined
          : {
            x:
              !endKeyFrame?.skew?.x && !startKeyFrame?.skew?.x
                ? undefined
                : (startKeyFrame?.skew?.x || 0) +
                ((endKeyFrame?.skew?.x || 0) - (startKeyFrame?.skew?.x || 0)) *
                transformPercent,
            y:
              !endKeyFrame?.skew?.y && !startKeyFrame?.skew?.y
                ? undefined
                : (startKeyFrame?.skew?.y || 0) +
                ((endKeyFrame?.skew?.y || 0) - (startKeyFrame?.skew?.y || 0)) * transformPercent
          },
      opacity:
        endKeyFrame?.opacity === undefined || startKeyFrame?.opacity === undefined
          ? undefined
          : startKeyFrame.opacity +
          (endKeyFrame.opacity - startKeyFrame.opacity) * transformPercent,
      blur:
        endKeyFrame?.blur === undefined || startKeyFrame?.blur === undefined
          ? undefined
          : startKeyFrame.blur + (endKeyFrame.blur - startKeyFrame.blur) * transformPercent,
      perspective:
        endKeyFrame?.perspective === undefined && startKeyFrame?.perspective === undefined
          ? undefined
          : endKeyFrame?.perspective || startKeyFrame?.perspective,
      origin:
        endKeyFrame?.origin === undefined && startKeyFrame?.origin === undefined
          ? undefined
          : endKeyFrame?.origin || startKeyFrame?.origin
    };
  }

  static getGroupKeyframes(animation: DslAnimationType): AnimationKeyFrames | undefined {
    if (animation.type === 'custom') return undefined;
    return AnimationUtils.getGroupKeyframesByContent(<AnimationGroupType>animation.content);
  }

  static getGroupKeyframesByContent(content: AnimationGroupType): AnimationKeyFrames | undefined {
    const animationInfo = AnimationGroupInfoList.find(info => info.effect === content.effect);
    if (animationInfo) {
      return animationInfo.achieveAnimationKeyFrames(content.direction);
    }
    return undefined;
  }

  static getValue(data: {
    value: number | { min: number, max: number },
    unit?: SizeUnit
  }): {
    value: number,
    unit?: SizeUnit
  } {
    if (typeof data.value === 'object') {
      return {
        value: NumberUtils.getRandomIntInRange(data.value.min, data.value.max),
        unit: data.unit ?? undefined
      };
    }
    return {
      value: data.value,
      unit: data.unit
    };
  }
}
