import MuteButton from "components/MuteButton";
import PlayButton from "components/PlayButton";
import SkipButton from "components/SkipButton";
import StopButton from "components/StopButton";
import React, { ReactElement, useRef, useState } from "react";
import "./App.css";

function App(): ReactElement {
  const [playingState, setPalyingState] = useState(false);
  const [muteState, setMuteState] = useState(true);
  const videoRef = useRef<null | HTMLVideoElement>(null);

  function playVideo() {
    if (videoRef.current === null) return;
    videoRef.current.play().catch(() => {
      console.error("플레이가 불가능합니다.");
    });
    setPalyingState(true);
  }

  function pauseVideo() {
    if (videoRef.current === null) return;
    videoRef.current.pause();
    setPalyingState(false);
  }

  function stopVideo() {
    if (videoRef.current === null) return;
    videoRef.current.pause();
    videoRef.current.currentTime = 0;
    setPalyingState(false);
  }

  function muteVideo() {
    if (videoRef.current === null) return;
    videoRef.current.muted = true;
    setMuteState(true);
  }

  function unmuteVideo() {
    if (videoRef.current === null) return;
    videoRef.current.muted = false;
    setMuteState(false);
  }

  function moveCurrentTime(targetTime: number) {
    if (videoRef.current === null) return;
    const { duration } = videoRef.current;
    let finalTime = targetTime < 0 ? 0 : targetTime;
    finalTime = finalTime > duration ? duration : finalTime;
    videoRef.current.currentTime = finalTime;
  }

  function skipVideo(skipTime: number) {
    if (videoRef.current === null) return;
    moveCurrentTime(videoRef.current.currentTime + skipTime);
  }

  function endVideo() {
    setPalyingState(false);
  }

  return (
    <div className="App">
      <video ref={videoRef} onEnded={endVideo} muted>
        <source
          id="videoTestSoure"
          src="https://ak.picdn.net/shutterstock/videos/1056468215/preview/stock-footage-top-view-of-drop-falls-into-water-and-diverging-circles-of-water-on-white-background-in-slow-motion.webm"
          type="video/webm"
        />
      </video>
      <br />
      <PlayButton
        playing={playingState}
        playEvent={playVideo}
        pauseEvent={pauseVideo}
      />
      <StopButton stopVideo={stopVideo} />
      <MuteButton
        muteState={muteState}
        muteVideo={muteVideo}
        unmuteVideo={unmuteVideo}
      />
      <SkipButton skipTime={-1} skipVideo={skipVideo} />
      <SkipButton skipTime={1} skipVideo={skipVideo} />
    </div>
  );
}

export default App;
