import React from "react";

interface MuteButtonProps {
  muteState: boolean;
  muteVideo: () => void;
  unmuteVideo: () => void;
}

function MuteButton({ muteState, muteVideo, unmuteVideo }: MuteButtonProps) {
  function clickMuteButton() {
    if (muteState) unmuteVideo();
    else muteVideo();
  }
  return (
    <button type="button" onClick={clickMuteButton}>
      {muteState ? "음소거 해제" : "음소거"}
    </button>
  );
}

export default MuteButton;
