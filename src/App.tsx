import ControlBar from "components/ControlBar";
import FullscreenButton from "components/FullscreenButton";
import MuteButton from "components/MuteButton";
import PlayButton from "components/PlayButton";
import RepeatBar from "components/RepeatBar";
import SkipButton from "components/SkipButton";
import StopButton from "components/StopButton";
import React, { ReactElement, useState } from "react";
import "./App.css";

function App(): ReactElement {
  const [isRepeat, setIsRepeat] = useState(false);
  const repeatOtion = {
    minTime: 1,
    maxTime: 2,
  };
  const [repeatTime, setRepeatTime] = useState({
    startTime: 0,
    endTime: repeatOtion.minTime,
  });
  const [videoRef, setVideoRef] = useState<null | HTMLVideoElement>(null);
  const skipTime = 1;

  function playVideo() {
    if (videoRef === null) return;
    videoRef.play().catch(() => {
      console.error("플레이가 불가능합니다.");
    });
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
  }

  function clickVideo() {
    if (videoRef === null) return;
    if (videoRef.paused) playVideo();
    else videoRef.pause();
  }

  function createRepeat() {
    if (videoRef === null) return;
    const { duration, currentTime } = videoRef;
    const { minTime } = repeatOtion;
    if (duration < minTime) {
      console.error("구간 반복을 생성할 수 없습니다.");
      return;
    }
    let repeatStart = currentTime;
    let repeatEnd = repeatStart + minTime;

    if (repeatStart < 0) {
      repeatStart = 0;
      repeatEnd = minTime;
    }

    if (repeatEnd > duration) {
      repeatStart = duration - minTime;
      repeatEnd = duration;
    }

    setRepeatTime({
      startTime: repeatStart,
      endTime: repeatEnd,
    });
    videoRef.pause();
    setIsRepeat(true);
  }

  function clickRepeatOnOff() {
    if (videoRef === null) return;
    if (isRepeat) {
      setIsRepeat(false);
      setRepeatTime({
        startTime: 0,
        endTime: repeatOtion.minTime,
      });
    } else {
      createRepeat();
      videoRef.pause();
      setIsRepeat(true);
    }
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
      <PlayButton videoRef={videoRef} />
      <StopButton
        videoRef={videoRef}
        moveCurrentTime={moveCurrentTime}
        isRepeat={isRepeat}
        startTime={repeatTime.startTime}
      />
      <MuteButton videoRef={videoRef} setMute={setMute} />
      <SkipButton
        videoRef={videoRef}
        skipTime={-skipTime}
        moveCurrentTime={moveCurrentTime}
        isRepeat={isRepeat}
        repeatTime={repeatTime}
      />
      <SkipButton
        videoRef={videoRef}
        skipTime={skipTime}
        moveCurrentTime={moveCurrentTime}
        isRepeat={isRepeat}
        repeatTime={repeatTime}
      />
      <FullscreenButton videoRef={videoRef} />
      <br />
      <ControlBar
        videoRef={videoRef}
        moveCurrentTime={moveCurrentTime}
        skipTime={skipTime}
        isRepeat={isRepeat}
        repeatTime={repeatTime}
        setRepeatTime={setRepeatTime}
      />
      <div>
        <button type="button" onClick={clickRepeatOnOff}>
          구간반복 on/off
        </button>
      </div>
      {isRepeat && (
        <RepeatBar
          videoRef={videoRef}
          repeatTime={repeatTime}
          setRepeatTime={setRepeatTime}
          moveCurrentTime={moveCurrentTime}
          repeatOtion={repeatOtion}
        />
      )}
    </div>
  );
}

export default App;
