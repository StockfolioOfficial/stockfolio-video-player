import React from "react";

interface StopButtonProps {
  stopVideo: () => void;
}

function StopButton({ stopVideo }: StopButtonProps) {
  return (
    <button type="button" onClick={stopVideo}>
      정지
    </button>
  );
}

export default StopButton;
