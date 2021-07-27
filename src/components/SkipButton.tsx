import React from "react";

interface SkipButtonProps {
  videoRef: HTMLVideoElement | null;
  skipTime: number;
  moveCurrentTime: (time: number) => void;
}

function SkipButton({
  videoRef,
  skipTime,
  moveCurrentTime,
  children,
}: SkipButtonProps & React.HTMLProps<HTMLButtonElement>) {
  function clickSkipButton() {
    if (videoRef === null) return;
    moveCurrentTime(videoRef.currentTime + skipTime);
  }

  return (
    <button type="button" onClick={clickSkipButton}>
      {children ||
        `${skipTime >= 0 ? skipTime : -skipTime}초 ${
          skipTime >= 0 ? "넘기기" : "되돌리기"
        }`}
    </button>
  );
}

export default SkipButton;
