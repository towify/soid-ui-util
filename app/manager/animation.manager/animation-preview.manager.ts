/*
 * @Author: allen
 * @Date: 2022/5/31
 */

import { AnimationContentType, AnimationGroupType } from '@towify-types/dsl/dsl.type';
import { AnimationEnum } from '@towify-types/dsl/animation.enum';
import { AnimationKeyFrameTransform, AnimationKeyFrames } from '../../type/animation.type';
import { easingFunction } from '../../type/animation.function';
import { AnimationUtils } from '../../utils/animation.utils/animation.utils';

export class AnimationPreviewManager {
  #isStopAnimation: boolean = false;
  #observeAnimationKeyFrameTransform?: (keyFrame?: AnimationKeyFrameTransform) => void;
  #animationFrame?: number;
  type: 'group' | 'custom' = 'custom';
  content?: AnimationContentType | AnimationGroupType;
  duration = 0;

  constructor(private readonly isInfinity: boolean) {}

  setAnimationInfo(params: {
    type: 'group' | 'custom';
    content: AnimationContentType | AnimationGroupType;
    duration: number;
    effect: AnimationEnum.Effect;
  }) {
    this.type = params.type;
    this.duration = params.duration * 1000;
    this.content = JSON.parse(JSON.stringify(params.content));
    if (this.type === 'group') {
      (this.content as AnimationGroupType).function = params.effect;
    } else {
      (this.content as AnimationContentType).effect = params.effect;
    }
    return this;
  }

  public observeAnimationKeyFrameTransform(hold: (keyFrame?: AnimationKeyFrameTransform) => void) {
    this.#observeAnimationKeyFrameTransform = hold;
  }

  public playAnimation() {
    if (this.#animationFrame) {
      window.cancelAnimationFrame(this.#animationFrame);
      this.#animationFrame = undefined;
    }
    this.#isStopAnimation = false;
    this.run().then();
  }

  public stopAnimation() {
    this.#isStopAnimation = true;
    if (this.#animationFrame) {
      window.cancelAnimationFrame(this.#animationFrame);
      this.#animationFrame = undefined;
    }
    this.#observeAnimationKeyFrameTransform && this.#observeAnimationKeyFrameTransform(undefined);
  }

  private async run() {
    let stop = false;
    let start: number | undefined;
    let percent: number;
    let easingPercent: number;
    let transform: AnimationKeyFrameTransform | undefined;
    let animationKeyFrames: AnimationKeyFrames | undefined;
    const duration = this.duration;
    const draw = (now: number) => {
      if (now - start! >= duration) {
        stop = true;
        percent = 1;
      } else {
        stop = false;
        percent = (now - start!) / duration;
      }
      if (this.#isStopAnimation) {
        percent = 0;
      }
      if (this.type === 'group') {
        easingPercent = easingFunction[(this.content as AnimationGroupType).function](percent);
        animationKeyFrames = AnimationUtils.getAnimationGroupKeyframesByContent(
          this.content as AnimationGroupType
        );
        if (animationKeyFrames) {
          transform = AnimationUtils.getAnimationKeyFrameTransform(
            animationKeyFrames,
            easingPercent
          );
        } else {
          transform = undefined;
        }
        this.#observeAnimationKeyFrameTransform &&
          this.#observeAnimationKeyFrameTransform(transform);
      } else if (this.type === 'custom') {
        easingPercent = easingFunction[(this.content as AnimationContentType).effect](percent);
        animationKeyFrames = AnimationUtils.getAnimationContentKeyFrames(
          this.content as AnimationContentType
        );
        if (animationKeyFrames) {
          transform = AnimationUtils.getAnimationKeyFrameTransform(
            animationKeyFrames,
            easingPercent
          );
        } else {
          transform = undefined;
        }
        this.#observeAnimationKeyFrameTransform &&
          this.#observeAnimationKeyFrameTransform(transform);
      }
      if (this.#isStopAnimation) {
        if (this.#animationFrame) {
          window.cancelAnimationFrame(this.#animationFrame);
          this.#animationFrame = undefined;
        }
      } else if (stop) {
        if (this.isInfinity) {
          start = window.performance.now();
          this.#animationFrame = window.requestAnimationFrame(draw);
        } else if (this.#animationFrame) {
          window.cancelAnimationFrame(this.#animationFrame);
          this.#animationFrame = undefined;
        }
      } else {
        this.#animationFrame = window.requestAnimationFrame(draw);
      }
    };
    const startAnimation = (timeStamp: number) => {
      start = timeStamp;
      draw(timeStamp);
    };
    startAnimation(window.performance.now());
  }
}
