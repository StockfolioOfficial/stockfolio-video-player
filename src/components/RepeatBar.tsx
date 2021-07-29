import React, { useEffect, useRef, useState } from "react";
import "./RepeatBar.css";

interface RepeatBarProps {
  videoRef: HTMLVideoElement | null;
  moveCurrentTime: (time: number) => void;
}

function RepeatBar({ videoRef, moveCurrentTime }: RepeatBarProps) {
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(4);
  const repeatItemRef = useRef<HTMLDivElement | null>(null);

  function repeatVideo() {
    if (videoRef === null) return;
    if (videoRef.currentTime < startTime || videoRef.currentTime >= endTime)
      moveCurrentTime(startTime);
  }

  function changeItemPosition() {
    if (repeatItemRef.current === null || videoRef === null) return;
    const { current: $item } = repeatItemRef;
    $item.style.left = `${(startTime / videoRef.duration) * 100}%`;
    $item.style.width = `${((endTime - startTime) / videoRef.duration) * 100}%`;
  }

  useEffect(() => {
    if (videoRef === null) return;
    function initSetPosition() {
      if (videoRef === null) return;
      if (videoRef.currentTime < startTime) moveCurrentTime(startTime);
      if (videoRef.currentTime > endTime) moveCurrentTime(endTime);
      changeItemPosition();
      videoRef.removeEventListener("canplay", initSetPosition);
    }
    videoRef.addEventListener("canplay", initSetPosition);
  }, [videoRef]);

  useEffect(() => {
    if (videoRef === null || repeatItemRef.current === null) return undefined;
    repeatVideo();
    changeItemPosition();
    videoRef.addEventListener("timeupdate", repeatVideo);
    return () => {
      videoRef.removeEventListener("timeupdate", repeatVideo);
      console.log(repeatVideo);
    };
  }, [startTime, endTime, videoRef, repeatItemRef]);

  return (
    <>
      <div id="RepeatBar">
        <div className="RepeatItem" ref={repeatItemRef}>
          <div className="start" />
          <div className="end" />
        </div>
      </div>
      <button type="button" onClick={() => setStartTime(1)}>
        1초 시작
      </button>
      <button type="button" onClick={() => setStartTime(2)}>
        2초 시작
      </button>
      <button type="button" onClick={() => setStartTime(3)}>
        3초 시작
      </button>
      <button type="button" onClick={() => setEndTime(4)}>
        4초 끝
      </button>
      <button type="button" onClick={() => setEndTime(5)}>
        5초 끝
      </button>
      <button type="button" onClick={() => setEndTime(6)}>
        6초 끝
      </button>
    </>
  );
}

export default RepeatBar;
