import React from "react";

interface SkipButtonProps {
  videoRef: HTMLVideoElement | null;
  skipTime: number;
  moveCurrentTime: (time: number) => void;
  isRepeat: boolean;
  repeatTime: {
    startTime: number;
    endTime: number;
  };
}

function SkipButton({
  videoRef,
  skipTime,
  moveCurrentTime,
  isRepeat,
  repeatTime,
  children,
}: SkipButtonProps & React.HTMLProps<HTMLButtonElement>) {
  function clickSkipButton() {
    if (videoRef === null) return;
    let afterTime = videoRef.currentTime + skipTime;
    if (isRepeat) {
      const { startTime, endTime } = repeatTime;

      if (afterTime < startTime) afterTime = startTime;
      if (afterTime > endTime) afterTime = endTime;
    }
    moveCurrentTime(afterTime);
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
