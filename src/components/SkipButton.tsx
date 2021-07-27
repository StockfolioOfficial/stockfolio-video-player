import React, { HTMLAttributes } from "react";

interface SkipButtonProps {
  skipTime: number;
  skipVideo: (time: number) => void;
}

function SkipButton({
  skipTime,
  skipVideo,
  children,
}: SkipButtonProps & HTMLAttributes<HTMLButtonElement>) {
  function clickSkipButton() {
    skipVideo(skipTime);
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
