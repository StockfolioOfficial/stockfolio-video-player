import React, { useEffect, useState } from "react";

interface MuteButtonProps {
  videoRef: HTMLVideoElement | null;
  setMute: (on: boolean) => void;
}

function MuteButton({ videoRef, setMute }: MuteButtonProps) {
  const [muteText, setMuteText] = useState("음소거 해제");
  function toggleMute() {
    if (videoRef === null) return;
    if (videoRef.muted) {
      setMute(!videoRef.muted);
      setMuteText("음소거 해제");
    } else {
      setMute(!videoRef.muted);
      setMuteText("음소거");
    }
  }
  useEffect(() => {
    if (videoRef === null) return;
    setMuteText(videoRef.muted ? "음소거 해제" : "음소거");
  }, [videoRef]);
  return (
    <button type="button" onClick={toggleMute}>
      {muteText}
    </button>
  );
}

export default MuteButton;
