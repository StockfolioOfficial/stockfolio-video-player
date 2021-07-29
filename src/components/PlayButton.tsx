import React, { useEffect, useState } from "react";

interface PlayButtonProps {
  videoRef: HTMLVideoElement | null;
}

function PlayButton({ videoRef }: PlayButtonProps) {
  const [playBtnText, setText] = useState("재생");
  function clickPlayButton() {
    if (videoRef === null) return;
    if (videoRef.paused)
      videoRef.play().catch(() => {
        console.error("재생 할 수 없습니다.");
      });
    else videoRef.pause();
  }

  function changeButtonText() {
    if (videoRef === null) return;
    if (videoRef.paused) setText("재생");
    else setText("일시정지");
  }

  useEffect(() => {
    if (videoRef === null) return;
    videoRef.addEventListener("playing", changeButtonText);
    videoRef.addEventListener("pause", changeButtonText);
  }, [videoRef]);

  return (
    <button type="button" onClick={clickPlayButton}>
      {playBtnText}
    </button>
  );
}

export default PlayButton;
