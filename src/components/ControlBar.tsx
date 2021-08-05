import React, { useEffect, useRef } from "react";
import "./ControlBar.css";

interface ControlBarProps {
  videoRef: HTMLVideoElement | null;
  moveCurrentTime: (time: number) => void;
  skipTime: number;
  isRepeat: boolean;
  repeatTime: {
    startTime: number;
    endTime: number;
  };
  setRepeatTime: React.Dispatch<
    React.SetStateAction<{
      startTime: number;
      endTime: number;
    }>
  >;
}

function ControlBar({
  videoRef,
  moveCurrentTime,
  skipTime,
  isRepeat,
  repeatTime,
  setRepeatTime,
}: ControlBarProps) {
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

  function changeRepeatTime(
    targetTime: number,
    targetOrigin?: "start" | "end"
  ) {
    if (videoRef === null) return;
    const repeatTimeLength = repeatTime.endTime - repeatTime.startTime;
    let afterRepeatStartTime = targetTime - repeatTimeLength / 2;
    let afterRepeatEndTime = targetTime + repeatTimeLength / 2;

    if (targetOrigin === "start") {
      afterRepeatStartTime = targetTime;
      afterRepeatEndTime = targetTime + repeatTimeLength;
    }

    if (targetOrigin === "end") {
      afterRepeatStartTime = targetTime - repeatTimeLength;
      afterRepeatEndTime = targetTime;
    }

    if (afterRepeatStartTime < 0) {
      afterRepeatStartTime = 0;
      afterRepeatEndTime = repeatTimeLength;
    } else if (afterRepeatEndTime > videoRef.duration) {
      afterRepeatStartTime = videoRef.duration - repeatTimeLength;
      afterRepeatEndTime = videoRef.duration;
    }

    setRepeatTime({
      startTime: afterRepeatStartTime,
      endTime: afterRepeatEndTime,
    });
  }

  function mouseDownControlBar(e: React.MouseEvent<HTMLDivElement>) {
    if (videoRef === null) return;
    const { clientWidth, offsetLeft } = e.currentTarget;
    const { duration, paused } = videoRef;
    let targetTimeLength = e.pageX - offsetLeft;
    let targetTime = duration * (targetTimeLength / clientWidth);
    const isChangeRepeatTime =
      isRepeat &&
      (targetTime < repeatTime.startTime || targetTime > repeatTime.endTime);

    if (!paused) videoRef.pause();
    if (isChangeRepeatTime) {
      changeRepeatTime(targetTime);
    }
    moveCurrentTime(targetTime);
    timeUpdateVideo();

    function mouseMoveControlBar(em: MouseEvent) {
      em.preventDefault();
      if (targetTimeLength === em.pageX - offsetLeft) return;
      targetTimeLength = em.pageX - offsetLeft;
      targetTime = duration * (targetTimeLength / clientWidth);
      if (isChangeRepeatTime) {
        changeRepeatTime(targetTime);
      }
      if (
        targetTime < repeatTime.startTime ||
        targetTime > repeatTime.endTime
      ) {
        changeRepeatTime(
          targetTime,
          targetTime < repeatTime.startTime ? "start" : "end"
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
          isRepeat && videoRef.currentTime + skipTime > repeatTime.endTime
            ? repeatTime.endTime
            : videoRef.currentTime + skipTime
        );
        break;
      case "ArrowLeft":
        moveCurrentTime(
          isRepeat && videoRef.currentTime - skipTime < repeatTime.startTime
            ? repeatTime.startTime
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
        (repeatTime.startTime / duration) * 100
      }%)`;
      $endDimmed.style.transform = `scaleX(${
        ((duration - repeatTime.endTime) / duration) * 100
      }%)`;
    } else {
      $startDimmed.style.transform = "scaleX(0)";
      $endDimmed.style.transform = "scaleX(0)";
    }
  }, [
    startDimmedRef.current,
    endDimmedRef.current,
    isRepeat,
    repeatTime,
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
