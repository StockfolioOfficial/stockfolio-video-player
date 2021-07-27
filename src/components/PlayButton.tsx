import React from "react";

interface PlayButtonProps {
  playing?: boolean;
  playEvent: () => void;
  pauseEvent: () => void;
}

function PlayButton({ playing, playEvent, pauseEvent }: PlayButtonProps) {
  function clickPlayButton() {
    if (playing === undefined || !playEvent || !pauseEvent) return;
    if (playing) pauseEvent();
    else playEvent();
  }

  return (
    <button type="button" onClick={clickPlayButton}>
      {playing ? "일시정지" : "재생"}
    </button>
  );
}

PlayButton.defaultProps = { playing: undefined };

export default PlayButton;
