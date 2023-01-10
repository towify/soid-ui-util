/*
 * @Author: allen
 * @Date: 2022/5/29
 */

import type { AnimationContentType, AnimationGroupType, DslAnimationType } from '@towify-types/dsl';
import {
  AnimationGroupInfoList,
  AnimationKeyFrameTransform,
  AnimationKeyFrames
} from '../../type/animation.type';
import { AnimationEnum } from '@towify-types/dsl';

export class AnimationUtils {
  public static getAnimationContentKeyFrames(content: AnimationContentType): AnimationKeyFrames {
    const startKeyFrame: AnimationKeyFrameTransform = {};
    const endKeyFrame: AnimationKeyFrameTransform = {};
    switch (content.type) {
      case AnimationEnum.Action.Skew: {
        startKeyFrame.skew ??= {};
        endKeyFrame.skew ??= {};
        switch (content.method) {
          case AnimationEnum.AxisMethod.X: {
            startKeyFrame.skew.x = content.value.start.value;
            endKeyFrame.skew.x = content.value.end.value;
            break;
          }
          case AnimationEnum.AxisMethod.Y: {
            startKeyFrame.skew.y = content.value.start.value;
            endKeyFrame.skew.y = content.value.end.value;
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
            startKeyFrame.translate.x = {
              value: content.value.start.value,
              unit: content.value.start.unit ?? 'px'
            };
            endKeyFrame.translate.x = {
              value: content.value.end.value,
              unit: content.value.end.unit ?? 'px'
            };
            break;
          }
          case AnimationEnum.AxisMethod.Y: {
            startKeyFrame.translate.y = {
              value: content.value.start.value,
              unit: content.value.start.unit ?? 'px'
            };
            endKeyFrame.translate.y = {
              value: content.value.end.value,
              unit: content.value.end.unit ?? 'px'
            };
            break;
          }
          case AnimationEnum.AxisMethod.Z: {
            startKeyFrame.translate.z = {
              value: content.value.start.value,
              unit: content.value.start.unit ?? 'px'
            };
            endKeyFrame.translate.z = {
              value: content.value.end.value,
              unit: content.value.end.unit ?? 'px'
            };
            break;
          }
          default:
            break;
        }
        break;
      }
      case AnimationEnum.Action.Scale: {
        startKeyFrame.scale ??= {
          x: content.value.start.value,
          y: content.value.start.value
        };
        endKeyFrame.scale ??= {
          x: content.value.end.value,
          y: content.value.end.value
        };
        break;
      }
      case AnimationEnum.Action.Opacity: {
        startKeyFrame.opacity = content.value.start.value;
        endKeyFrame.opacity = content.value.end.value;
        break;
      }
      case AnimationEnum.Action.Rotate: {
        if (!content.rotated3d) break;
        // Rotate 的 Perspective 只在 X Y 动画下生效
        startKeyFrame.rotation = {
          x: content.rotated3d.x,
          y: content.rotated3d.y,
          z: content.rotated3d.z,
          angle: content.value.start.value
        };
        endKeyFrame.rotation = {
          x: content.rotated3d.x,
          y: content.rotated3d.y,
          z: content.rotated3d.z,
          angle: content.value.end.value
        };
        if (content.method !== AnimationEnum.AxisMethod.Z) {
          startKeyFrame.perspective = content.perspective;
          endKeyFrame.perspective = content.perspective;
        }
        break;
      }
      default:
        break;
    }
    return {
      0: startKeyFrame,
      100: endKeyFrame
    };
  }

  static getAnimationKeyFrameTransform(
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
      endTranslate?: { value: number; unit: 'px' | '%' },
      startTranslate?: { value: number; unit: 'px' | '%' }
    ) => {
      if (!endTranslate && !startTranslate) {
        return undefined;
      }
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
        unit: endTranslate?.unit || startTranslate?.unit || 'px'
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

  static getAnimationGroupKeyframes(animation: DslAnimationType): AnimationKeyFrames | undefined {
    if (animation.type === 'custom' || Array.isArray(animation.content)) return undefined;
    return AnimationUtils.getAnimationGroupKeyframesByContent(<AnimationGroupType>animation.content);
  }

  static getAnimationGroupKeyframesByContent(
    content: AnimationGroupType
  ): AnimationKeyFrames | undefined {
    const animationInfo = AnimationGroupInfoList.find(info => info.effect === content.effect);
    if (animationInfo) {
      return animationInfo.achieveAnimationKeyFrames(content.direction);
    }
    return undefined;
  }
}
