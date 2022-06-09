/*
 * @Author: allen
 * @Date: 2022/5/30
 */

import { Performance } from 'soid-data';
import { AnimationEnum, AnimationGroupType, DslAnimationType } from '@towify-types/dsl';
import { easingFunction } from '../../type/animation.function';
import { AnimationUtils } from '../../utils/animation.utils/animation.utils';
import { AnimationKeyFrameTransform, AnimationKeyFrames } from '../../type/animation.type';

export class AnimationManager {
  readonly #duration: number;
  readonly #delayDuration: number;
  readonly #times: number;
  #hasDelay = false;
  #executedTimes = 0;
  #observeAnimationKeyFrameTransform?: (keyFrame?: AnimationKeyFrameTransform) => void;
  #startTime: number | undefined;
  #percent = 0;
  #animationFrame: number | undefined;
  #isPlaying = false;
  #isPause = false;
  #delayTimes = 0;

  constructor(
    private readonly animation: DslAnimationType,
    private readonly isBothFill: boolean,
    private readonly isReverseFill: boolean
  ) {
    this.#duration = this.animation.duration * 1000;
    this.#delayDuration = this.animation.delay * 1000;
    // 如果 animation 的 times 设定为 0 的话那么意味着是无限次执行 infinity
    const timeValue = this.animation.times.value ? this.animation.times.value : Number.MAX_VALUE;
    this.#times =
      this.animation.times.type === AnimationEnum.Execution.Custom
        ? this.animation.times.value ?? 1
        : timeValue;
  }

  public observeAnimationKeyFrameTransform(hold: (keyFrame?: AnimationKeyFrameTransform) => void) {
    this.#observeAnimationKeyFrameTransform = hold;
  }

  public execute(complete: () => void) {
    const run = () => {
      this.#executedTimes += 1;
      if (this.#executedTimes > this.#times) {
        return;
      }
      const callBack = () => {
        if (this.#executedTimes === this.#times) {
          complete();
          this.#isPlaying = false;
        }
        return run();
      };
      this.run(() => {
        callBack();
      }).then();
    };
    if (!this.#isPause) {
      this.#executedTimes = 0;
    }
    if (this.#isPlaying) {
      this.stop();
    }
    if (!this.#isPause) {
      this.#hasDelay = false;
    }
    return run();
  }

  public stop() {
    this.#isPlaying = false;
    this.#isPause = false;
    if (this.#animationFrame) {
      window.cancelAnimationFrame(this.#animationFrame);
      this.#animationFrame = undefined;
    }
    this.#percent = 0;
    this.#observeAnimationKeyFrameTransform && this.#observeAnimationKeyFrameTransform(undefined);
    this.#startTime = undefined;
  }

  public pause() {
    this.#isPause = true;
    this.#isPlaying = false;
    if (this.#animationFrame) {
      window.cancelAnimationFrame(this.#animationFrame);
      this.#animationFrame = undefined;
    }
  }

  private async run(callback?: () => void) {
    let stop = false;
    let isExecutingReverse = false;
    const duration = this.#duration / (this.isReverseFill ? 2 : 1);
    this.#isPlaying = true;
    const draw = (now: number) => {
      if (now - this.#startTime! >= duration) {
        stop = true;
        this.#percent = 1;
      } else {
        this.#percent = (now - this.#startTime!) / duration;
      }
      this.runAnimationKeyFrame(isExecutingReverse);
      if (!this.#isPlaying) {
        return;
      }
      if (stop) {
        if (isExecutingReverse || this.isBothFill) {
          if (this.#animationFrame) {
            window.cancelAnimationFrame(this.#animationFrame);
            this.#animationFrame = undefined;
          }
          callback && callback();
        } else {
          stop = false;
          isExecutingReverse = true;
          this.#animationFrame = window.requestAnimationFrame(time => {
            this.#startTime = time;
            draw(time);
          });
        }
      } else {
        this.#animationFrame = window.requestAnimationFrame(draw);
      }
    };
    if (!this.#hasDelay && this.#delayDuration > 0) {
      this.#delayTimes += 1;
      await Performance.delay(this.#delayDuration);
      this.#delayTimes -= 1;
      this.#hasDelay = true;
      if (this.#delayTimes > 0 || !this.#isPlaying) {
        return;
      }
    }
    const startAnimation = (timeStamp: number) => {
      if (!this.#isPause) {
        this.#startTime = timeStamp;
      } else {
        this.#startTime = timeStamp - this.#percent * duration;
      }
      this.#isPause = false;
      draw(timeStamp);
    };
    startAnimation(window.performance.now());
  }

  private runAnimationKeyFrame(isExecutingReverse: boolean) {
    let easingPercent: number;
    let transform: AnimationKeyFrameTransform | undefined;
    let animationKeyFrames: AnimationKeyFrames | undefined;
    if (this.animation.type === 'group') {
      easingPercent = easingFunction[(this.animation.content as AnimationGroupType).function](
        isExecutingReverse ? 1 - this.#percent : this.#percent
      );
      animationKeyFrames = AnimationUtils.getAnimationGroupKeyframes(this.animation);
      if (animationKeyFrames) {
        transform = AnimationUtils.getAnimationKeyFrameTransform(animationKeyFrames, easingPercent);
      } else {
        transform = undefined;
      }
      this.#observeAnimationKeyFrameTransform && this.#observeAnimationKeyFrameTransform(transform);
    } else if (Array.isArray(this.animation.content)) {
      this.animation.content.forEach(item => {
        easingPercent = easingFunction[item.effect](
          isExecutingReverse ? 1 - this.#percent : this.#percent
        );
        animationKeyFrames = AnimationUtils.getAnimationContentKeyFrames(item);
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
      });
    }
  }
}