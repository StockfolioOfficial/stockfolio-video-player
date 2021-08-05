import React from "react";

interface StopButtonProps {
  videoRef: HTMLVideoElement | null;
  moveCurrentTime: (time: number) => void;
  isRepeat: boolean;
  startTime: number;
}

function StopButton({
  videoRef,
  moveCurrentTime,
  isRepeat,
  startTime,
}: StopButtonProps) {
  function stopVideo() {
    if (videoRef === null) return;
    videoRef.pause();
    moveCurrentTime(isRepeat ? startTime : 0);
  }

  return (
    <button type="button" onClick={stopVideo}>
      정지
    </button>
  );
}

export default StopButton;
