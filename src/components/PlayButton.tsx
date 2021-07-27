import React from "react";

interface PlayButtonProps {
  isPause: boolean;
  playEvent: () => void;
  pauseEvent: () => void;
}

function PlayButton({ isPause, playEvent, pauseEvent }: PlayButtonProps) {
  function clickPlayButton() {
    if (isPause) playEvent();
    else pauseEvent();
  }

  return (
    <button type="button" onClick={clickPlayButton}>
      {isPause ? "재생" : "일시정지"}
    </button>
  );
}

export default PlayButton;
