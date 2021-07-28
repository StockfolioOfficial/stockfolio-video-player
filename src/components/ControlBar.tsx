import React, { useEffect, useRef, useState } from "react";
import "./ControlBar.css";

interface ControlBarProps {
  videoRef: HTMLVideoElement | null;
  moveCurrentTime: (target: number) => void;
  playVideo: () => void;
  pauseVideo: () => void;
}

function ControlBar({
  videoRef,
  moveCurrentTime,
  playVideo,
  pauseVideo,
}: ControlBarProps) {
  const [currentTime, setCurrentTime] = useState(0);
  const progressBarRef = useRef<HTMLDivElement | null>(null);
  function clickControlBar(e: React.MouseEvent) {
    if (videoRef === null) return;
    moveCurrentTime(
      videoRef.duration * (e.nativeEvent.offsetX / e.currentTarget.clientWidth)
    );
  }
  function keyDownControlBar(e: React.KeyboardEvent) {
    if (videoRef === null) return;
    if (e.code === "ArrowRight") moveCurrentTime(videoRef.currentTime + 1);
    if (e.code === "ArrowLeft") moveCurrentTime(videoRef.currentTime - 1);
    if (e.code === "Enter" || e.code === "Space") {
      if (videoRef.paused) playVideo();
      else pauseVideo();
    }
  }

  function timeUpdate() {
    if (videoRef === null) return;
    setCurrentTime(videoRef.currentTime);
  }

  useEffect(() => {
    if (videoRef === null) return;
    videoRef.addEventListener("timeupdate", timeUpdate);
  }, [videoRef]);

  useEffect(() => {
    if (progressBarRef.current === null || videoRef === null) return;
    progressBarRef.current.style.width = `${
      (videoRef.currentTime / videoRef.duration) * 100
    }%`;
  }, [currentTime]);

  return (
    <div
      id="ControlBar"
      onClick={clickControlBar}
      onKeyDown={keyDownControlBar}
      role="button"
      tabIndex={0}
    >
      <div id="ProgressBar" ref={progressBarRef} />
    </div>
  );
}

export default ControlBar;
