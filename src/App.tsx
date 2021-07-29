import ControlBar from "components/ControlBar";
import FullscreenButton from "components/FullscreenButton";
import MuteButton from "components/MuteButton";
import PlayButton from "components/PlayButton";
import SkipButton from "components/SkipButton";
import StopButton from "components/StopButton";
import React, { ReactElement, useState } from "react";
import "./App.css";

function App(): ReactElement {
  const [videoRef, setVideoRef] = useState<null | HTMLVideoElement>(null);
  const [isPause, setIsPause] = useState(true);
  const [isMute, setIsMute] = useState(true);

  function playVideo() {
    if (videoRef === null) return;
    videoRef
      .play()
      .then(() => {
        setIsPause(false);
      })
      .catch(() => {
        console.error("플레이가 불가능합니다.");
      });
  }

  function pauseVideo() {
    if (videoRef === null) return;
    videoRef.pause();
    setIsPause(true);
  }

  function stopVideo() {
    if (videoRef === null) return;
    pauseVideo();
    videoRef.currentTime = 0;
  }

  function moveCurrentTime(targetTime: number) {
    if (videoRef === null) return;
    const { duration } = videoRef;
    let finalTime = targetTime < 0 ? 0 : targetTime;
    finalTime = finalTime > duration ? duration : finalTime;
    videoRef.currentTime = finalTime;
  }

  function setMute(on: boolean) {
    if (videoRef === null) return;
    videoRef.muted = on;
    setIsMute(on);
  }

  function clickVideo() {
    if (videoRef === null) return;
    if (videoRef.paused) playVideo();
    else pauseVideo();
  }

  return (
    <div className="App">
      <video ref={setVideoRef} onClick={clickVideo} muted>
        <source
          id="videoTestSoure"
          src="https://ak.picdn.net/shutterstock/videos/1056468215/preview/stock-footage-top-view-of-drop-falls-into-water-and-diverging-circles-of-water-on-white-background-in-slow-motion.webm"
          type="video/webm"
        />
      </video>
      <br />
      <PlayButton
        isPause={isPause}
        playEvent={playVideo}
        pauseEvent={pauseVideo}
      />
      <StopButton stopVideo={stopVideo} />
      <MuteButton isMute={isMute} setMute={setMute} />
      <SkipButton
        videoRef={videoRef}
        skipTime={-1}
        moveCurrentTime={moveCurrentTime}
      />
      <SkipButton
        videoRef={videoRef}
        skipTime={1}
        moveCurrentTime={moveCurrentTime}
      />
      <FullscreenButton videoRef={videoRef} />
      <br />
      <ControlBar
        videoRef={videoRef}
        moveCurrentTime={moveCurrentTime}
        skipTime={1}
      />
    </div>
  );
}

export default App;
