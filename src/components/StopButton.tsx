import repeatStore from "contexts/repeatStore";
import React, { useContext } from "react";

interface StopButtonProps {
  videoRef: HTMLVideoElement | null;
  moveCurrentTime: (time: number) => void;
}

function StopButton({ videoRef, moveCurrentTime }: StopButtonProps) {
  const { state } = useContext(repeatStore);
  const { isRepeat, repeatControllerState } = state;
  function stopVideo() {
    if (videoRef === null) return;
    videoRef.pause();
    moveCurrentTime(isRepeat ? repeatControllerState.startTime : 0);
  }

  return (
    <button type="button" onClick={stopVideo}>
      정지
    </button>
  );
}

export default StopButton;
