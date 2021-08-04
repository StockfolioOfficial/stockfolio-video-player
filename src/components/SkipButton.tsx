import React from "react";

interface SkipButtonProps {
  videoRef: HTMLVideoElement | null;
  skipTime: number;
  moveCurrentTime: (time: number) => void;
  repeatOn: boolean;
  repeatTime: {
    startTime: number;
    endTime: number;
  };
}

function SkipButton({
  videoRef,
  skipTime,
  moveCurrentTime,
  repeatOn,
  repeatTime,
  children,
}: SkipButtonProps & React.HTMLProps<HTMLButtonElement>) {
  function clickSkipButton() {
    if (videoRef === null) return;
    let afterTime = videoRef.currentTime + skipTime;
    if (repeatOn) {
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
