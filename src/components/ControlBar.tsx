import repeatStore from "contexts/repeatStore";
import React, { useContext, useEffect, useRef } from "react";
import "./ControlBar.css";

interface ControlBarProps {
  videoRef: HTMLVideoElement | null;
  moveCurrentTime: (time: number) => void;
  skipTime: number;
}

function ControlBar({ videoRef, moveCurrentTime, skipTime }: ControlBarProps) {
  const { state: repeatState, action: repeatAction } = useContext(repeatStore);
  const { isRepeat, repeatControllerState, repeatTimelineState } = repeatState;
  const {
    startTime: repeatStart,
    endTime: repeatEnd,
    duration: repeatDuration,
  } = repeatControllerState;
  const {
    startTime: repeatTimelineStartTime,
    endTime: repeatTimelineEndTime,
    duration: repeatTimelineDuration,
  } = repeatTimelineState;
  const { setRepeatControllerState, setRepeatTimelineState } = repeatAction;
  const progressBarRef = useRef<HTMLDivElement | null>(null);
  const startDimmedRef = useRef<HTMLDivElement | null>(null);
  const endDimmedRef = useRef<HTMLDivElement | null>(null);

  function playVideo() {
    if (videoRef === null) return;
    videoRef.play().catch(() => {
      console.error("동영상을 재생할 수 없습니다.", "Control-bar");
    });
  }

  function timeUpdateVideo() {
    if (videoRef === null || progressBarRef.current === null) return;
    progressBarRef.current.style.transform = `scaleX(${
      (videoRef.currentTime / videoRef.duration) * 100
    }%)`;

    if (!videoRef.paused) window.requestAnimationFrame(timeUpdateVideo);
  }

  function changeReapeatState(targetTime: number, option?: "start" | "end") {
    if (videoRef === null) return;
    let afterRepeatStart = targetTime - repeatDuration / 2;
    let afterRepeatEnd = targetTime + repeatDuration / 2;
    let afterRepeatTimelineStart = targetTime - repeatTimelineDuration / 2;
    let afterRepeatTimelineEnd = targetTime + repeatTimelineDuration / 2;

    if (option === "start") {
      afterRepeatStart = targetTime;
      afterRepeatEnd = targetTime + repeatDuration;
      afterRepeatTimelineStart = targetTime;
      afterRepeatTimelineEnd = targetTime + repeatTimelineDuration;
    }

    if (option === "end") {
      afterRepeatStart = targetTime - repeatDuration;
      afterRepeatEnd = targetTime;
      afterRepeatTimelineStart = targetTime - repeatTimelineDuration;
      afterRepeatTimelineEnd = targetTime;
    }

    if (afterRepeatStart < 0) {
      afterRepeatStart = 0;
      afterRepeatEnd = repeatDuration;
    }

    if (afterRepeatEnd > videoRef.duration) {
      afterRepeatStart = videoRef.duration - repeatDuration;
      afterRepeatEnd = videoRef.duration;
    }

    if (afterRepeatTimelineStart < 0) {
      afterRepeatTimelineStart = 0;
      afterRepeatTimelineEnd = repeatTimelineDuration;
    }

    if (afterRepeatTimelineEnd > videoRef.duration) {
      afterRepeatTimelineStart = videoRef.duration - repeatTimelineDuration;
      afterRepeatTimelineEnd = videoRef.duration;
    }

    setRepeatControllerState({
      ...repeatControllerState,
      startTime: afterRepeatStart,
      endTime: afterRepeatEnd,
    });

    if (option === "start" && targetTime > repeatTimelineStartTime) return;
    if (option === "end" && targetTime < repeatTimelineEndTime) return;

    setRepeatTimelineState({
      ...repeatTimelineState,
      startTime: afterRepeatTimelineStart,
      endTime: afterRepeatTimelineEnd,
    });
  }

  function mouseDownControlBar(e: React.MouseEvent<HTMLDivElement>) {
    if (videoRef === null) return;
    const { clientWidth, offsetLeft } = e.currentTarget;
    const { duration, paused } = videoRef;
    let targetTimeLength = e.pageX - offsetLeft;
    let targetTime = duration * (targetTimeLength / clientWidth);

    if (!paused) videoRef.pause();
    moveCurrentTime(targetTime);
    timeUpdateVideo();

    const isOverRepeatRange =
      isRepeat && (targetTime < repeatStart || targetTime > repeatEnd);

    if (isOverRepeatRange) {
      changeReapeatState(targetTime);
    }

    function mouseMoveControlBar(em: MouseEvent) {
      em.preventDefault();
      if (targetTimeLength === em.pageX - offsetLeft) return;
      targetTimeLength = em.pageX - offsetLeft;
      targetTime = duration * (targetTimeLength / clientWidth);

      moveCurrentTime(targetTime);
      timeUpdateVideo();

      if (isOverRepeatRange) {
        changeReapeatState(targetTime);
      } else if (targetTime < repeatStart) {
        changeReapeatState(targetTime, "start");
      } else if (targetTime > repeatEnd) {
        changeReapeatState(targetTime, "end");
      }
    }

    function mouseUpControlBar() {
      document.removeEventListener("mousemove", mouseMoveControlBar);
      document.removeEventListener("mouseup", mouseUpControlBar);
      if (!paused) playVideo();
    }

    document.addEventListener("mousemove", mouseMoveControlBar);
    document.addEventListener("mouseup", mouseUpControlBar);
  }

  function keyDownControlBar(e: React.KeyboardEvent) {
    if (videoRef === null) return;
    switch (e.code) {
      case "ArrowRight":
        moveCurrentTime(
          isRepeat &&
            videoRef.currentTime + skipTime > repeatControllerState.endTime
            ? repeatControllerState.endTime
            : videoRef.currentTime + skipTime
        );
        break;
      case "ArrowLeft":
        moveCurrentTime(
          isRepeat &&
            videoRef.currentTime - skipTime < repeatControllerState.startTime
            ? repeatControllerState.startTime
            : videoRef.currentTime - skipTime
        );
        break;
      case "Enter":
      case "Space":
        if (videoRef.paused) playVideo();
        else videoRef.pause();
        break;
      default:
        console.log(e.code);
    }
    timeUpdateVideo();
  }

  useEffect(() => {
    if (videoRef === null) return undefined;
    const isPausedUpdateVideo = () => {
      if (!videoRef.paused) return;
      timeUpdateVideo();
    };
    videoRef.addEventListener("playing", timeUpdateVideo);
    videoRef.addEventListener("timeupdate", isPausedUpdateVideo);
    return () => {
      videoRef.removeEventListener("playing", timeUpdateVideo);
      videoRef.removeEventListener("timeupdate", isPausedUpdateVideo);
    };
  }, [videoRef]);

  useEffect(() => {
    if (
      startDimmedRef.current === null ||
      endDimmedRef.current === null ||
      videoRef === null
    )
      return;
    const { current: $startDimmed } = startDimmedRef;
    const { current: $endDimmed } = endDimmedRef;
    const { duration } = videoRef;
    if (isRepeat) {
      $startDimmed.style.transform = `scaleX(${
        (repeatControllerState.startTime / duration) * 100
      }%)`;
      $endDimmed.style.transform = `scaleX(${
        ((duration - repeatControllerState.endTime) / duration) * 100
      }%)`;
    } else {
      $startDimmed.style.transform = "scaleX(0)";
      $endDimmed.style.transform = "scaleX(0)";
    }
  }, [
    startDimmedRef.current,
    endDimmedRef.current,
    isRepeat,
    repeatControllerState,
    videoRef,
  ]);

  return (
    <div
      id="controlBar"
      onKeyDown={keyDownControlBar}
      onMouseDown={mouseDownControlBar}
      role="button"
      tabIndex={0}
    >
      <div id="progressBar" ref={progressBarRef} />
      <div id="startDimmed" className="dimmed" ref={startDimmedRef} />
      <div id="endDimmed" className="dimmed" ref={endDimmedRef} />
    </div>
  );
}

export default ControlBar;
