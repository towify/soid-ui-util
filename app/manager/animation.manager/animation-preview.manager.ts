/*
 * @Author: allen
 * @Date: 2022/5/31
 */

import { AnimationEnum } from '@towify-types/dsl/animation.enum';
import { Performance } from 'soid-data';
import { AnimationKeyFrames, AnimationKeyFrameTransform } from '../../type/animation.type';
import { easingFunction } from '../../type/animation.function';
import { AnimationUtils } from '../../utils/animation.utils/animation.utils';
import type { AnimationContentType, AnimationGroupType } from '@towify-types/dsl';

export class AnimationPreviewManager {
  #isStopAnimation = false;
  #isPlaying = false;
  #observeAnimationKeyFrameTransform?: (keyFrame?: AnimationKeyFrameTransform) => void;
  #animationFrame?: number;
  type: 'group' | 'custom' = 'custom';
  content?: { animation: AnimationContentType, effect: AnimationEnum.Effect } | AnimationGroupType;
  duration = 0;

  constructor(private readonly isInfinity: boolean) {
  }

  setAnimationInfo(params: {
    type: 'group' | 'custom';
    content: { animation: AnimationContentType, effect: AnimationEnum.Effect } | AnimationGroupType;
    duration: number;
    effect: AnimationEnum.Effect;
  }) {
    this.type = params.type;
    this.duration = params.duration * 1000;
    this.content = JSON.parse(JSON.stringify(params.content));
    if (this.type === 'group') {
      (this.content as AnimationGroupType).function = params.effect;
    } else {
      (<{ animation: AnimationContentType, effect: AnimationEnum.Effect }>this.content).effect = params.effect;
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
    this.#run().then();
  }

  public stopAnimation() {
    this.#isStopAnimation = true;
    this.#isPlaying = false;
    if (this.#animationFrame) {
      window.cancelAnimationFrame(this.#animationFrame);
      this.#animationFrame = undefined;
    }
    this.#observeAnimationKeyFrameTransform && this.#observeAnimationKeyFrameTransform(undefined);
  }

  async #run() {
    let stop = false;
    let start: number | undefined;
    let percent: number;
    let easingPercent: number;
    let transform: AnimationKeyFrameTransform | undefined;
    let animationKeyFrames: AnimationKeyFrames | undefined;
    const duration = this.duration;
    if ((<{ animation: AnimationContentType, effect: AnimationEnum.Effect }>this.content).animation) {
      (<{ animation: AnimationContentType, effect: AnimationEnum.Effect }>this.content).animation.value.start = AnimationUtils.getValue(
        (<{ animation: AnimationContentType, effect: AnimationEnum.Effect }>this.content).animation.value.start
      );
      (<{ animation: AnimationContentType, effect: AnimationEnum.Effect }>this.content).animation.value.end = AnimationUtils.getValue(
        (<{ animation: AnimationContentType, effect: AnimationEnum.Effect }>this.content).animation.value.end
      );
    }
    const draw = async (now: number) => {
      if (now - start! >= duration) {
        stop = true;
        percent = 1;
      } else {
        stop = false;
        percent = (now - start!) / duration;
      }
      if (this.type === 'group') {
        easingPercent = easingFunction[(this.content as AnimationGroupType).function](percent);
        animationKeyFrames = AnimationUtils.getAnimationGroupKeyframesByContent(<AnimationGroupType>this.content);
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
        easingPercent = easingFunction[(<{ animation: AnimationContentType, effect: AnimationEnum.Effect }>this.content).effect](percent);
        animationKeyFrames = AnimationUtils.getAnimationContentKeyFrames((<{ animation: AnimationContentType, effect: AnimationEnum.Effect }>this.content).animation);
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
          this.#observeAnimationKeyFrameTransform &&
          this.#observeAnimationKeyFrameTransform(undefined);
        }
      } else if (stop) {
        if (this.#animationFrame) {
          window.cancelAnimationFrame(this.#animationFrame);
          this.#animationFrame = undefined;
        }
        this.#isPlaying = false;
        if (this.isInfinity) {
          await Performance.delay(500);
          if (!this.#isStopAnimation && !this.#isPlaying) {
            start = window.performance.now();
            this.#animationFrame = window.requestAnimationFrame(draw);
          }
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
    this.#isPlaying = true;
  }
}
