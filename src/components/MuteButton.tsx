import React from "react";

interface MuteButtonProps {
  isMute: boolean;
  setMute: (on: boolean) => void;
}

function MuteButton({ isMute, setMute }: MuteButtonProps) {
  function clickMuteButton() {
    setMute(!isMute);
  }
  return (
    <button type="button" onClick={clickMuteButton}>
      {isMute ? "음소거 해제" : "음소거"}
    </button>
  );
}

export default MuteButton;
