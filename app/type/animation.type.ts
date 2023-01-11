/*
 * @Author: allen
 * @Date: 2021/11/18
 */

import { AnimationEnum } from '@towify-types/dsl';
import { SizeUnit } from '@towify/common-values';

export type AnimationKeyFrameTransform = {
  translate?: {
    x?: { value: number; unit: SizeUnit.PX | SizeUnit.Percent };
    y?: { value: number; unit: SizeUnit.PX | SizeUnit.Percent };
    z?: { value: number; unit: SizeUnit.PX | SizeUnit.Percent };
  };
  scale?: {
    x?: number;
    y?: number;
    z?: number;
  };
  rotation?: {
    x?: number;
    y?: number;
    z?: number;
    angle: number;
  };
  skew?: {
    x?: number;
    y?: number;
  };
  blur?: number;
  opacity?: number;
  perspective?: { value: number; unit: SizeUnit };
  origin?: string;
};

export type AnimationKeyFrames = {
  // animation percent, min value = 0, max value = 100
  [percent in number]: AnimationKeyFrameTransform;
};

export const AnimationGroupEffectKeyFrames: { [key: string]: AnimationKeyFrames } = {
  shake: {
    0: { translate: { x: { value: 0, unit: SizeUnit.PX } } },
    10: { translate: { x: { value: -10, unit: SizeUnit.PX } } },
    30: { translate: { x: { value: -10, unit: SizeUnit.PX } } },
    50: { translate: { x: { value: -10, unit: SizeUnit.PX } } },
    70: { translate: { x: { value: -10, unit: SizeUnit.PX } } },
    90: { translate: { x: { value: -10, unit: SizeUnit.PX } } },
    20: { translate: { x: { value: 10, unit: SizeUnit.PX } } },
    40: { translate: { x: { value: 10, unit: SizeUnit.PX } } },
    60: { translate: { x: { value: 10, unit: SizeUnit.PX } } },
    80: { translate: { x: { value: 10, unit: SizeUnit.PX } } },
    100: { translate: { x: { value: 0, unit: SizeUnit.PX } } }
  },
  swing: {
    0: { rotation: { z: 1, angle: 0 } },
    20: { rotation: { z: 1, angle: 15 } },
    40: { rotation: { z: 1, angle: -10 } },
    60: { rotation: { z: 1, angle: 5 } },
    80: { rotation: { z: 1, angle: -5 } },
    100: { rotation: { z: 1, angle: 0 } }
  },
  wobble: {
    0: { translate: { x: { value: 0, unit: SizeUnit.Percent } }, rotation: { z: 1, angle: 0 } },
    15: { translate: { x: { value: -25, unit: SizeUnit.Percent } }, rotation: { z: 1, angle: -5 } },
    30: { translate: { x: { value: 20, unit: SizeUnit.Percent } }, rotation: { z: 1, angle: 3 } },
    45: { translate: { x: { value: -15, unit: SizeUnit.Percent } }, rotation: { z: 1, angle: -3 } },
    60: { translate: { x: { value: 10, unit: SizeUnit.Percent } }, rotation: { z: 1, angle: 2 } },
    75: { translate: { x: { value: -4, unit: SizeUnit.Percent } }, rotation: { z: 1, angle: -1 } },
    100: { translate: { x: { value: 0, unit: SizeUnit.Percent } }, rotation: { z: 1, angle: 0 } }
  },
  drop: {
    0: { translate: { y: { value: -500, unit: SizeUnit.PX } }, opacity: 0 },
    20: { translate: { y: { value: 0, unit: SizeUnit.PX } }, opacity: 1 },
    40: { translate: { y: { value: -30, unit: SizeUnit.PX } } },
    43: { translate: { y: { value: -30, unit: SizeUnit.PX } } },
    58: { translate: { y: { value: 0, unit: SizeUnit.PX } } },
    70: { translate: { y: { value: -15, unit: SizeUnit.PX } } },
    80: { translate: { y: { value: 0, unit: SizeUnit.PX } } },
    90: { translate: { y: { value: -4, unit: SizeUnit.PX } } },
    100: { translate: { y: { value: 0, unit: SizeUnit.PX } } }
  },
  bounceFromTop: {
    0: { translate: { y: { value: 0, unit: SizeUnit.PX } } },
    20: { translate: { y: { value: 0, unit: SizeUnit.PX } } },
    40: { translate: { y: { value: -30, unit: SizeUnit.PX } } },
    43: { translate: { y: { value: -30, unit: SizeUnit.PX } } },
    53: { translate: { y: { value: 0, unit: SizeUnit.PX } } },
    70: { translate: { y: { value: -15, unit: SizeUnit.PX } } },
    80: { translate: { y: { value: 0, unit: SizeUnit.PX } } },
    90: { translate: { y: { value: -4, unit: SizeUnit.PX } } },
    100: { translate: { y: { value: 0, unit: SizeUnit.PX } } }
  },
  bounceFromLeft: {
    0: { translate: { x: { value: 0, unit: SizeUnit.PX } } },
    20: { translate: { x: { value: 0, unit: SizeUnit.PX } } },
    40: { translate: { x: { value: -30, unit: SizeUnit.PX } } },
    43: { translate: { x: { value: -30, unit: SizeUnit.PX } } },
    53: { translate: { x: { value: 0, unit: SizeUnit.PX } } },
    70: { translate: { x: { value: -15, unit: SizeUnit.PX } } },
    80: { translate: { x: { value: 0, unit: SizeUnit.PX } } },
    90: { translate: { x: { value: -4, unit: SizeUnit.PX } } },
    100: { translate: { x: { value: 0, unit: SizeUnit.PX } } }
  },
  bounceFromBottom: {
    0: { translate: { y: { value: 0, unit: SizeUnit.PX } } },
    20: { translate: { y: { value: 0, unit: SizeUnit.PX } } },
    40: { translate: { y: { value: 30, unit: SizeUnit.PX } } },
    43: { translate: { y: { value: 30, unit: SizeUnit.PX } } },
    53: { translate: { y: { value: 0, unit: SizeUnit.PX } } },
    70: { translate: { y: { value: 15, unit: SizeUnit.PX } } },
    80: { translate: { y: { value: 0, unit: SizeUnit.PX } } },
    90: { translate: { y: { value: 4, unit: SizeUnit.PX } } },
    100: { translate: { y: { value: 0, unit: SizeUnit.PX } } }
  },
  bounceFromRight: {
    0: { translate: { x: { value: 0, unit: SizeUnit.PX } } },
    20: { translate: { x: { value: 0, unit: SizeUnit.PX } } },
    40: { translate: { x: { value: 30, unit: SizeUnit.PX } } },
    43: { translate: { x: { value: 30, unit: SizeUnit.PX } } },
    53: { translate: { x: { value: 0, unit: SizeUnit.PX } } },
    70: { translate: { x: { value: 15, unit: SizeUnit.PX } } },
    80: { translate: { x: { value: 0, unit: SizeUnit.PX } } },
    90: { translate: { x: { value: 4, unit: SizeUnit.PX } } },
    100: { translate: { x: { value: 0, unit: SizeUnit.PX } } }
  },
  zoomIn: {
    0: { opacity: 0, scale: { x: 0.1, y: 0.1 } },
    19: { opacity: 0, scale: { x: 0.1, y: 0.1 } },
    20: { opacity: 1, scale: { x: 0.1, y: 0.1 } },
    100: { opacity: 1, scale: { x: 1, y: 1 } }
  },
  zoomOut: {
    0: { opacity: 1, scale: { x: 1, y: 1 } },
    80: { opacity: 1, scale: { x: 0.1, y: 0.1 } },
    81: { opacity: 0, scale: { x: 0.1, y: 0.1 } },
    100: { opacity: 0, scale: { x: 0.1, y: 0.1 } }
  },
  rotationIn: {
    0: { opacity: 0, rotation: { z: 1, angle: -200 } },
    70: { opacity: 1, rotation: { z: 1, angle: 0 } },
    100: { opacity: 1, rotation: { z: 1, angle: 0 } }
  },
  rotationOut: {
    0: { opacity: 1, rotation: { z: 1, angle: 0 } },
    70: { opacity: 0, rotation: { z: 1, angle: -200 } },
    100: { opacity: 0, rotation: { z: 1, angle: -200 } }
  },
  pivotFromTopLeft: {
    0: { opacity: 0, rotation: { z: 1, angle: -45 }, origin: 'left bottom' },
    100: { opacity: 1, rotation: { z: 1, angle: 0 }, origin: 'left bottom' }
  },
  pivotFromTopRight: {
    0: { opacity: 0, rotation: { z: 1, angle: 45 }, origin: 'right bottom' },
    100: { opacity: 1, rotation: { z: 1, angle: 0 }, origin: 'right bottom' }
  },
  pivotFromBottomLeft: {
    0: { opacity: 0, rotation: { z: 1, angle: 45 }, origin: 'left bottom' },
    100: { opacity: 1, rotation: { z: 1, angle: 0 }, origin: 'left bottom' }
  },
  pivotFromBottomRight: {
    0: { opacity: 0, rotation: { z: 1, angle: -45 }, origin: 'right bottom' },
    100: { opacity: 1, rotation: { z: 1, angle: 0 }, origin: 'right bottom' }
  },
  flipFromTop: {
    0: { perspective: { value: 400, unit: SizeUnit.PX }, opacity: 0, rotation: { x: 1, angle: 135 } },
    60: { perspective: { value: 400, unit: SizeUnit.PX }, opacity: 1, rotation: { x: 1, angle: -20 } },
    70: { perspective: { value: 400, unit: SizeUnit.PX }, opacity: 1, rotation: { x: 1, angle: 10 } },
    90: { perspective: { value: 400, unit: SizeUnit.PX }, opacity: 1, rotation: { x: 1, angle: -5 } },
    100: { perspective: { value: 400, unit: SizeUnit.PX }, opacity: 1, rotation: { x: 1, angle: 0 } }
  },
  flipFromBottom: {
    0: { perspective: { value: 400, unit: SizeUnit.PX }, opacity: 0, rotation: { x: 1, angle: -135 } },
    60: { perspective: { value: 400, unit: SizeUnit.PX }, opacity: 1, rotation: { x: 1, angle: 20 } },
    70: { perspective: { value: 400, unit: SizeUnit.PX }, opacity: 1, rotation: { x: 1, angle: -10 } },
    90: { perspective: { value: 400, unit: SizeUnit.PX }, opacity: 1, rotation: { x: 1, angle: 5 } },
    100: { perspective: { value: 400, unit: SizeUnit.PX }, opacity: 1, rotation: { x: 1, angle: 0 } }
  },
  flipFromLeft: {
    0: { perspective: { value: 400, unit: SizeUnit.PX }, opacity: 0, rotation: { y: 1, angle: -135 } },
    60: { perspective: { value: 400, unit: SizeUnit.PX }, opacity: 1, rotation: { y: 1, angle: 20 } },
    70: { perspective: { value: 400, unit: SizeUnit.PX }, opacity: 1, rotation: { y: 1, angle: -10 } },
    90: { perspective: { value: 400, unit: SizeUnit.PX }, opacity: 1, rotation: { y: 1, angle: 5 } },
    100: { perspective: { value: 400, unit: SizeUnit.PX }, opacity: 1, rotation: { y: 1, angle: 0 } }
  },
  flipFromRight: {
    0: { perspective: { value: 400, unit: SizeUnit.PX }, opacity: 0, rotation: { y: 1, angle: 135 } },
    60: { perspective: { value: 400, unit: SizeUnit.PX }, opacity: 1, rotation: { y: 1, angle: -20 } },
    70: { perspective: { value: 400, unit: SizeUnit.PX }, opacity: 1, rotation: { y: 1, angle: 10 } },
    90: { perspective: { value: 400, unit: SizeUnit.PX }, opacity: 1, rotation: { y: 1, angle: -5 } },
    100: { perspective: { value: 400, unit: SizeUnit.PX }, opacity: 1, rotation: { y: 1, angle: 0 } }
  },
  fadeAndScaleIn: {
    0: { opacity: 0, scale: { x: 0.3, y: 0.3 } },
    70: { opacity: 1, scale: { x: 1, y: 1 } },
    100: { opacity: 1, scale: { x: 1, y: 1 } }
  },
  fadeAndScaleOut: {
    0: { opacity: 0, scale: { x: 1.7, y: 1.7 } },
    70: { opacity: 1, scale: { x: 1, y: 1 } },
    100: { opacity: 1, scale: { x: 1, y: 1 } }
  },
  fadeAndMoveFromLeft: {
    0: { opacity: 0, translate: { x: { value: -100, unit: SizeUnit.Percent } } },
    100: { opacity: 1, translate: { x: { value: 0, unit: SizeUnit.Percent } } }
  },
  fadeAndMoveFromRight: {
    0: { opacity: 0, translate: { x: { value: 100, unit: SizeUnit.Percent } } },
    100: { opacity: 1, translate: { x: { value: 0, unit: SizeUnit.Percent } } }
  },
  fadeAndMoveFromTop: {
    0: { opacity: 0, translate: { y: { value: -100, unit: SizeUnit.Percent } } },
    100: { opacity: 1, translate: { y: { value: 0, unit: SizeUnit.Percent } } }
  },
  fadeAndMoveFromBottom: {
    0: { opacity: 0, translate: { y: { value: 100, unit: SizeUnit.Percent } } },
    100: { opacity: 1, translate: { y: { value: 0, unit: SizeUnit.Percent } } }
  },
  fadeAndMoveFromTopLeft: {
    0: {
      opacity: 0,
      translate: { x: { value: -100, unit: SizeUnit.Percent }, y: { value: -100, unit: SizeUnit.Percent } }
    },
    100: { opacity: 1, translate: { x: { value: 0, unit: SizeUnit.Percent }, y: { value: 0, unit: SizeUnit.Percent } } }
  },
  fadeAndMoveFromTopRight: {
    0: {
      opacity: 0,
      translate: { x: { value: 100, unit: SizeUnit.Percent }, y: { value: -100, unit: SizeUnit.Percent } }
    },
    100: { opacity: 1, translate: { x: { value: 0, unit: SizeUnit.Percent }, y: { value: 0, unit: SizeUnit.Percent } } }
  },
  fadeAndMoveFromBottomLeft: {
    0: {
      opacity: 0,
      translate: { x: { value: -100, unit: SizeUnit.Percent }, y: { value: 100, unit: SizeUnit.Percent } }
    },
    100: { opacity: 1, translate: { x: { value: 0, unit: SizeUnit.Percent }, y: { value: 0, unit: SizeUnit.Percent } } }
  },
  fadeAndMoveFromBottomRight: {
    0: {
      opacity: 0,
      translate: { x: { value: 100, unit: SizeUnit.Percent }, y: { value: 100, unit: SizeUnit.Percent } }
    },
    100: { opacity: 1, translate: { x: { value: 0, unit: SizeUnit.Percent }, y: { value: 0, unit: SizeUnit.Percent } } }
  },
  pop: {
    0: { opacity: 0, scale: { x: 0.3, y: 0.3 } },
    10: { opacity: 0, scale: { x: 0.3, y: 0.3 } },
    70: { opacity: 1, scale: { x: 1.2, y: 1.2 } },
    90: { opacity: 1, scale: { x: 0.8, y: 0.8 } },
    100: { opacity: 1, scale: { x: 1, y: 1 } }
  },
  dissolve: {
    0: { opacity: 0 },
    100: { opacity: 1 }
  },
  blur: {
    0: { opacity: 0, blur: 50 },
    20: { opacity: 0.5, blur: 40 },
    100: { opacity: 1, blur: 0 }
  }
};

export const AnimationGroupInfoList: {
  effect: AnimationEnum.GroupEffect;
  achieveAnimationKeyFrames: (direction: AnimationEnum.Direction) => AnimationKeyFrames;
}[] = [
  {
    effect: AnimationEnum.GroupEffect.FadeAndMove,
    achieveAnimationKeyFrames: direction => {
      switch (direction) {
        case AnimationEnum.Direction.LeftToRight:
          return AnimationGroupEffectKeyFrames.fadeAndMoveFromLeft;
        case AnimationEnum.Direction.TopToBottom:
          return AnimationGroupEffectKeyFrames.fadeAndMoveFromTop;
        case AnimationEnum.Direction.RightToLeft:
          return AnimationGroupEffectKeyFrames.fadeAndMoveFromRight;
        case AnimationEnum.Direction.BottomToTop:
          return AnimationGroupEffectKeyFrames.fadeAndMoveFromBottom;
        case AnimationEnum.Direction.TopLeftToBottomRight:
          return AnimationGroupEffectKeyFrames.fadeAndMoveFromTopLeft;
        case AnimationEnum.Direction.TopRightToBottomLeft:
          return AnimationGroupEffectKeyFrames.fadeAndMoveFromTopRight;
        case AnimationEnum.Direction.BottomLeftToTopRight:
          return AnimationGroupEffectKeyFrames.fadeAndMoveFromBottomLeft;
        case AnimationEnum.Direction.BottomRightToTopLeft:
          return AnimationGroupEffectKeyFrames.fadeAndMoveFromBottomRight;
        default:
          return AnimationGroupEffectKeyFrames.fadeAndMoveFromLeft;
      }
    }
  },
  {
    effect: AnimationEnum.GroupEffect.Zoom,
    achieveAnimationKeyFrames: direction => {
      if (direction === AnimationEnum.Direction.Forward) {
        return AnimationGroupEffectKeyFrames.zoomIn;
      }
      return AnimationGroupEffectKeyFrames.zoomOut;
    }
  },
  {
    effect: AnimationEnum.GroupEffect.FadeAndScale,
    achieveAnimationKeyFrames: direction => {
      if (direction === AnimationEnum.Direction.Forward) {
        return AnimationGroupEffectKeyFrames.fadeAndScaleIn;
      }
      return AnimationGroupEffectKeyFrames.fadeAndScaleOut;
    }
  },
  {
    effect: AnimationEnum.GroupEffect.Rotate,
    achieveAnimationKeyFrames: direction => {
      if (direction === AnimationEnum.Direction.Forward) {
        return AnimationGroupEffectKeyFrames.rotationIn;
      }
      return AnimationGroupEffectKeyFrames.rotationOut;
    }
  },
  {
    effect: AnimationEnum.GroupEffect.Pivot,
    achieveAnimationKeyFrames: direction => {
      switch (direction) {
        case AnimationEnum.Direction.TopLeftToBottomRight:
          return AnimationGroupEffectKeyFrames.pivotFromTopLeft;
        case AnimationEnum.Direction.TopRightToBottomLeft:
          return AnimationGroupEffectKeyFrames.pivotFromTopRight;
        case AnimationEnum.Direction.BottomLeftToTopRight:
          return AnimationGroupEffectKeyFrames.pivotFromBottomLeft;
        case AnimationEnum.Direction.BottomRightToTopLeft:
          return AnimationGroupEffectKeyFrames.pivotFromBottomRight;
        default:
          return AnimationGroupEffectKeyFrames.pivotFromTopLeft;
      }
    }
  },
  {
    effect: AnimationEnum.GroupEffect.Flip,
    achieveAnimationKeyFrames: direction => {
      switch (direction) {
        case AnimationEnum.Direction.LeftToRight:
          return AnimationGroupEffectKeyFrames.flipFromLeft;
        case AnimationEnum.Direction.TopToBottom:
          return AnimationGroupEffectKeyFrames.flipFromTop;
        case AnimationEnum.Direction.RightToLeft:
          return AnimationGroupEffectKeyFrames.flipFromRight;
        case AnimationEnum.Direction.BottomToTop:
          return AnimationGroupEffectKeyFrames.flipFromBottom;
        default:
          return AnimationGroupEffectKeyFrames.flipFromLeft;
      }
    }
  },
  {
    effect: AnimationEnum.GroupEffect.Bounce,
    achieveAnimationKeyFrames: direction => {
      switch (direction) {
        case AnimationEnum.Direction.LeftToRight:
          return AnimationGroupEffectKeyFrames.bounceFromLeft;
        case AnimationEnum.Direction.TopToBottom:
          return AnimationGroupEffectKeyFrames.bounceFromTop;
        case AnimationEnum.Direction.RightToLeft:
          return AnimationGroupEffectKeyFrames.bounceFromRight;
        case AnimationEnum.Direction.BottomToTop:
          return AnimationGroupEffectKeyFrames.bounceFromBottom;
        default:
          return AnimationGroupEffectKeyFrames.bounceFromTop;
      }
    }
  },
  {
    effect: AnimationEnum.GroupEffect.Drop,
    achieveAnimationKeyFrames: () => {
      return AnimationGroupEffectKeyFrames.drop;
    }
  },
  {
    effect: AnimationEnum.GroupEffect.Shake,
    achieveAnimationKeyFrames: () => {
      return AnimationGroupEffectKeyFrames.shake;
    }
  },
  {
    effect: AnimationEnum.GroupEffect.Swing,
    achieveAnimationKeyFrames: () => {
      return AnimationGroupEffectKeyFrames.swing;
    }
  },
  {
    effect: AnimationEnum.GroupEffect.Wobble,
    achieveAnimationKeyFrames: () => {
      return AnimationGroupEffectKeyFrames.wobble;
    }
  },
  {
    effect: AnimationEnum.GroupEffect.Pop,
    achieveAnimationKeyFrames: () => {
      return AnimationGroupEffectKeyFrames.pop;
    }
  },
  {
    effect: AnimationEnum.GroupEffect.Dissolve,
    achieveAnimationKeyFrames: () => {
      return AnimationGroupEffectKeyFrames.dissolve;
    }
  },
  {
    effect: AnimationEnum.GroupEffect.Blur,
    achieveAnimationKeyFrames: () => {
      return AnimationGroupEffectKeyFrames.blur;
    }
  }
];
