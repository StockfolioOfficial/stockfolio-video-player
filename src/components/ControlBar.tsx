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
  const { isRepeat, repeatControllerState } = repeatState;
  const { setRepeatControllerState } = repeatAction;
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

  function changerepeatControllerState(
    targetTime: number,
    targetOrigin?: "start" | "end"
  ) {
    if (videoRef === null) return;
    const repeatControllerStateLength =
      repeatControllerState.endTime - repeatControllerState.startTime;
    let afterRepeatStartTime = targetTime - repeatControllerStateLength / 2;
    let afterRepeatEndTime = targetTime + repeatControllerStateLength / 2;

    if (targetOrigin === "start") {
      afterRepeatStartTime = targetTime;
      afterRepeatEndTime = targetTime + repeatControllerStateLength;
    }

    if (targetOrigin === "end") {
      afterRepeatStartTime = targetTime - repeatControllerStateLength;
      afterRepeatEndTime = targetTime;
    }

    if (afterRepeatStartTime < 0) {
      afterRepeatStartTime = 0;
      afterRepeatEndTime = repeatControllerStateLength;
    } else if (afterRepeatEndTime > videoRef.duration) {
      afterRepeatStartTime = videoRef.duration - repeatControllerStateLength;
      afterRepeatEndTime = videoRef.duration;
    }

    setRepeatControllerState({
      startTime: afterRepeatStartTime,
      endTime: afterRepeatEndTime,
      duration: afterRepeatEndTime - afterRepeatStartTime,
    });
  }

  function mouseDownControlBar(e: React.MouseEvent<HTMLDivElement>) {
    if (videoRef === null) return;
    const { clientWidth, offsetLeft } = e.currentTarget;
    const { duration, paused } = videoRef;
    let targetTimeLength = e.pageX - offsetLeft;
    let targetTime = duration * (targetTimeLength / clientWidth);
    const isChangerepeatControllerState =
      isRepeat &&
      (targetTime < repeatControllerState.startTime ||
        targetTime > repeatControllerState.endTime);

    if (!paused) videoRef.pause();
    if (isChangerepeatControllerState) {
      changerepeatControllerState(targetTime);
    }
    moveCurrentTime(targetTime);
    timeUpdateVideo();

    function mouseMoveControlBar(em: MouseEvent) {
      em.preventDefault();
      if (targetTimeLength === em.pageX - offsetLeft) return;
      targetTimeLength = em.pageX - offsetLeft;
      targetTime = duration * (targetTimeLength / clientWidth);
      if (isChangerepeatControllerState) {
        changerepeatControllerState(targetTime);
      }
      if (
        targetTime < repeatControllerState.startTime ||
        targetTime > repeatControllerState.endTime
      ) {
        changerepeatControllerState(
          targetTime,
          targetTime < repeatControllerState.startTime ? "start" : "end"
        );
      }
      moveCurrentTime(targetTime);
      timeUpdateVideo();
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
    videoRef.addEventListener("playing", timeUpdateVideo);
    return () => {
      videoRef.removeEventListener("playing", timeUpdateVideo);
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
