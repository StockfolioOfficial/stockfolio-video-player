import React, { useEffect, useRef } from "react";
import "./ControlBar.css";

interface ControlBarProps {
  videoRef: HTMLVideoElement | null;
  moveCurrentTime: (time: number) => void;
  skipTime: number;
}

function ControlBar({ videoRef, moveCurrentTime, skipTime }: ControlBarProps) {
  const progressBarRef = useRef<HTMLDivElement | null>(null);

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
      moveCurrentTime(videoRef.currentTime + skipTime);
    if (e.code === "ArrowLeft")
      moveCurrentTime(videoRef.currentTime - skipTime);
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
  }

  useEffect(() => {
    if (videoRef === null) return;
    videoRef.addEventListener("timeupdate", timeUpdateVideo);
  }, [videoRef]);

  return (
    <div
      id="ControlBar"
      onKeyDown={keyDownControlBar}
      onMouseDown={mouseDownControlBar}
      role="button"
      tabIndex={0}
    >
      <div id="ProgressBar" ref={progressBarRef} />
    </div>
  );
}

export default ControlBar;
