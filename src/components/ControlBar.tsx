import React, { useEffect, useRef } from "react";
import "./ControlBar.css";

interface ControlBarProps {
  videoRef: HTMLVideoElement | null;
  moveCurrentTime: (time: number) => void;
  skipTime: number;
  repeatOn: boolean;
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
  repeatOn,
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

  function changeRepeatTime(targetTime: number) {
    if (videoRef === null) return;
    const repeatTimeLength = repeatTime.endTime - repeatTime.startTime;
    let afterRepeatStartTime = targetTime - repeatTimeLength / 2;
    let afterRepeatEndTime = targetTime + repeatTimeLength / 2;

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
      repeatOn &&
      (targetTime < repeatTime.startTime || targetTime > repeatTime.endTime);

    if (!paused) videoRef.pause();
    if (isChangeRepeatTime) {
      changeRepeatTime(targetTime);
    }
    moveCurrentTime(targetTime);

    function mouseMoveControlBar(em: MouseEvent) {
      if (targetTimeLength === em.pageX - offsetLeft) return;
      targetTimeLength = em.pageX - offsetLeft;
      targetTime = duration * (targetTimeLength / clientWidth);
      if (isChangeRepeatTime) {
        changeRepeatTime(targetTime);
      }
      moveCurrentTime(targetTime);
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
    if (e.code === "ArrowRight")
      moveCurrentTime(
        repeatOn && videoRef.currentTime + skipTime > repeatTime.endTime
          ? repeatTime.endTime
          : videoRef.currentTime + skipTime
      );
    if (e.code === "ArrowLeft")
      moveCurrentTime(
        repeatOn && videoRef.currentTime - skipTime < repeatTime.startTime
          ? repeatTime.startTime
          : videoRef.currentTime - skipTime
      );
    if (e.code === "Enter" || e.code === "Space") {
      if (videoRef.paused) playVideo();
      else videoRef.pause();
    }
  }

  function timeUpdateVideo() {
    if (videoRef === null || progressBarRef.current === null) return;
    progressBarRef.current.style.transform = `scaleX(${
      (videoRef.currentTime / videoRef.duration) * 100
    }%)`;

    if (!videoRef.paused) window.requestAnimationFrame(timeUpdateVideo);
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
    if (repeatOn) {
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
    repeatOn,
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
