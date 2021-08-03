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
}

function ControlBar({
  videoRef,
  moveCurrentTime,
  skipTime,
  repeatOn,
  repeatTime,
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

  function mouseDownControlBar(e: React.MouseEvent<HTMLDivElement>) {
    if (videoRef === null) return;
    const { clientWidth, offsetLeft } = e.currentTarget;
    const { duration, paused } = videoRef;
    let currentRate = e.pageX - offsetLeft;

    moveCurrentTime(duration * (currentRate / clientWidth));
    if (!paused) videoRef.pause();

    function mouseMoveControlBar(em: MouseEvent) {
      if (currentRate === em.pageX - offsetLeft) return;
      currentRate = em.pageX - offsetLeft;
      moveCurrentTime(duration * (currentRate / clientWidth));
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
