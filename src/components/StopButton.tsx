import React from "react";

interface StopButtonProps {
  videoRef: HTMLVideoElement | null;
  moveCurrentTime: (time: number) => void;
}

function StopButton({ videoRef, moveCurrentTime }: StopButtonProps) {
  function stopVideo() {
    if (videoRef === null) return;
    videoRef.pause();
    moveCurrentTime(0);
  }

  return (
    <button type="button" onClick={stopVideo}>
      정지
    </button>
  );
}

export default StopButton;
