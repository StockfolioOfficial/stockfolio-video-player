import repeatStore from "contexts/repeatStore";
import React, { useContext } from "react";

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
  const { state } = useContext(repeatStore);
  const { isRepeat, repeatControllerState } = state;
  function clickSkipButton() {
    if (videoRef === null) return;
    let afterTime = videoRef.currentTime + skipTime;
    if (isRepeat) {
      const { startTime, endTime } = repeatControllerState;

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
