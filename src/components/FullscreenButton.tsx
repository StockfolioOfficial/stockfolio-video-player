import React from "react";

interface FullscreenButtonProps {
  videoRef: HTMLVideoElement | null;
}

function FullscreenButton({ videoRef }: FullscreenButtonProps) {
  function clickFullscreenButton() {
    if (videoRef === null) return;
    videoRef.requestFullscreen().catch(() => {
      console.error("전체 화면으로 볼 수 없습니다.");
    });
  }
  return (
    <button type="button" onClick={clickFullscreenButton}>
      전체화면으로 보기
    </button>
  );
}

export default FullscreenButton;
