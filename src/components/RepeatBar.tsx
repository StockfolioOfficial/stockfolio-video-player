import repeatStore from "contexts/repeatStore";
import React, { useContext, useEffect, useRef } from "react";
import "./RepeatBar.css";

interface RepeatBarProps {
  videoRef: HTMLVideoElement | null;
  moveCurrentTime: (time: number) => void;
}

function RepeatBar({ videoRef, moveCurrentTime }: RepeatBarProps) {
  const { state, action } = useContext(repeatStore);
  const { isRepeat, repeatControllerState, repeatOption, repeatTimelineState } =
    state;
  const { minTime, maxTime } = repeatOption;
  const { setRepeatControllerState, setRepeatTimelineState, setIsRepeat } =
    action;
  const repeatTimeLineRef = useRef<HTMLDivElement | null>(null);
  const repeatControllerRef = useRef<HTMLDivElement | null>(null);

  function createRepeat() {
    if (videoRef === null) return;
    const { duration, currentTime } = videoRef;
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

    setRepeatControllerState({
      startTime: repeatStart,
      endTime: repeatEnd,
      duration: minTime,
    });
    videoRef.pause();
    setIsRepeat(true);
  }

  function clickRepeat() {
    if (videoRef === null) return;
    if (isRepeat) {
      setIsRepeat(false);
      setRepeatControllerState({
        startTime: 0,
        endTime: minTime,
        duration: minTime,
      });
    } else {
      createRepeat();
      videoRef.pause();
      setIsRepeat(true);
    }
  }

  function repeatVideo() {
    if (videoRef === null) return;
    if (
      videoRef.currentTime > repeatControllerState.endTime ||
      videoRef.currentTime < repeatControllerState.startTime - 0.1
    )
      moveCurrentTime(repeatControllerState.startTime);
  }

  function roopReatVideo() {
    repeatVideo();
    if (videoRef !== null && !videoRef.paused)
      window.requestAnimationFrame(roopReatVideo);
  }

  function convertLengthToTime(targetLength: number) {
    if (repeatTimeLineRef.current === null) return NaN;
    const { clientWidth } = repeatTimeLineRef.current;
    const { duration: timelineDuration } = repeatTimelineState;
    return (timelineDuration * targetLength) / clientWidth;
  }

  function setInitrepeatTimelineState() {
    if (videoRef === null) return;
    const { duration, currentTime } = videoRef;
    let repeatViewDuration: number = maxTime * 3;

    if (repeatViewDuration > duration) repeatViewDuration = duration;
    let repeatViewStartTime =
      currentTime + minTime / 2 - repeatViewDuration / 2;
    let repeatViewEndTime = repeatViewStartTime + repeatViewDuration;

    if (repeatViewStartTime < 0) {
      repeatViewStartTime = 0;
      repeatViewEndTime = repeatViewDuration;
    }

    if (repeatViewEndTime > duration) {
      repeatViewEndTime = duration;
      repeatViewStartTime = duration - repeatViewDuration;
    }
    setRepeatTimelineState({
      startTime: repeatViewStartTime,
      endTime: repeatViewEndTime,
      duration: repeatViewDuration,
    });
  }

  function setRepeatControllerPosition() {
    const { startTime, endTime } = repeatControllerState;
    if (repeatControllerRef.current === null) return;
    const { current: $controller } = repeatControllerRef;
    const { startTime: repeatViewStartTime, duration: repeatViewDuration } =
      repeatTimelineState;
    $controller.style.left = `${
      ((startTime - repeatViewStartTime) / repeatViewDuration) * 100
    }%`;
    $controller.style.width = `${
      ((endTime - startTime) / repeatViewDuration) * 100
    }%`;
  }

  function mouseDownController(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target !== e.currentTarget) return;
    if (
      videoRef === null ||
      repeatControllerRef.current === null ||
      repeatTimeLineRef.current === null
    )
      return;
    let { clientX: baseX } = e.nativeEvent;
    const { duration, paused } = videoRef;
    const {
      duration: controlDuration,
      startTime: controlStartTime,
      endTime: controlEndTime,
    } = repeatControllerState;
    let { startTime: timelineStartTime, endTime: timelineEndTime } =
      repeatTimelineState;
    const timelineDuration = repeatTimelineState.duration;

    let afterStart = controlStartTime;
    let afterEnd = controlEndTime;
    let roopId: number | null = null;
    let speed = 0;

    if (!paused) videoRef.pause();

    function moveTimeLine(acc: number) {
      speed += acc;
      timelineStartTime += speed;
      timelineEndTime += speed;
      console.log(speed);
      if (timelineStartTime < 0) {
        timelineStartTime = 0;
        timelineEndTime = timelineDuration;
      }

      if (timelineEndTime > duration) {
        timelineStartTime = duration - timelineDuration;
        timelineEndTime = duration;
      }

      setRepeatTimelineState({
        ...repeatTimelineState,
        startTime: timelineStartTime,
        endTime: timelineEndTime,
      });

      if (acc > 0) {
        afterStart = timelineEndTime - controlDuration;
        afterEnd = timelineEndTime;
      } else {
        afterStart = timelineStartTime;
        afterEnd = timelineStartTime + controlDuration;
      }

      setRepeatControllerState({
        ...repeatControllerState,
        startTime: afterStart,
        endTime: afterEnd,
      });

      if (timelineStartTime > 0 && timelineEndTime < duration)
        window.requestAnimationFrame(() => moveTimeLine(acc));
    }

    function mouseMoveController(em: MouseEvent) {
      em.preventDefault();
      const { clientX } = em;
      const movedTime = convertLengthToTime(clientX - baseX);
      afterStart += movedTime;
      afterEnd += movedTime;
      baseX = clientX;

      if (afterStart < 0) {
        afterStart = 0;
        afterEnd = controlDuration;
      }

      if (afterEnd > duration) {
        afterStart = duration - controlDuration;
        afterEnd = duration;
      }

      if (afterStart < timelineStartTime || afterEnd > timelineEndTime) {
        if (roopId === null)
          roopId = window.requestAnimationFrame(() =>
            moveTimeLine(afterStart < timelineStartTime ? -0.001 : 0.001)
          );
        return;
      }

      setRepeatControllerState({
        ...repeatControllerState,
        startTime: afterStart,
        endTime: afterEnd,
      });

      if (roopId === null) return;
      console.log("roopId", roopId);
      window.cancelAnimationFrame(roopId);
      roopId = null;
      speed = 0;
    }
    function mouseUpController() {
      document.removeEventListener("mousemove", mouseMoveController);
      document.removeEventListener("mouseup", mouseUpController);
      if (roopId === null) return;
      window.cancelAnimationFrame(roopId);
      roopId = null;
      speed = 0;
    }
    document.addEventListener("mousemove", mouseMoveController);
    document.addEventListener("mouseup", mouseUpController);
  }

  function mouseDownControllerEdge(
    e: React.MouseEvent<HTMLDivElement>,
    target: "start" | "end"
  ) {
    if (
      videoRef === null ||
      repeatControllerRef.current === null ||
      repeatTimeLineRef.current === null
    )
      return;
    let { clientX: baseX } = e.nativeEvent;
    const { startTime: timelineStartTime, endTime: timelineEndTime } =
      repeatTimelineState;
    const { startTime: controlStartTime, endTime: controlEndTime } =
      repeatControllerState;
    let afterTime = target === "start" ? controlStartTime : controlEndTime;
    let moveMaxTime =
      target === "start"
        ? controlEndTime - minTime
        : controlStartTime + maxTime;
    let moveMinTime =
      target === "start"
        ? controlEndTime - maxTime
        : controlStartTime + minTime;

    moveMaxTime = moveMaxTime > timelineEndTime ? timelineEndTime : moveMaxTime;
    moveMinTime =
      moveMinTime < timelineStartTime ? timelineStartTime : moveMinTime;

    if (!videoRef.paused) videoRef.pause();

    function mouseMoveEdge(em: MouseEvent) {
      em.preventDefault();
      const { clientX } = em;
      afterTime += convertLengthToTime(clientX - baseX);
      baseX = clientX;
      afterTime = moveMaxTime < afterTime ? moveMaxTime : afterTime;
      afterTime = moveMinTime > afterTime ? moveMinTime : afterTime;
      setRepeatControllerState({
        ...repeatControllerState,
        duration:
          target === "start"
            ? controlEndTime - afterTime
            : afterTime - controlStartTime,
        [target === "start" ? "startTime" : "endTime"]: afterTime,
      });
      moveCurrentTime(afterTime);
    }
    function mouseUpEdge() {
      document.removeEventListener("mousemove", mouseMoveEdge);
      document.removeEventListener("mouseup", mouseUpEdge);
    }

    document.addEventListener("mousemove", mouseMoveEdge);
    document.addEventListener("mouseup", mouseUpEdge);
  }

  function parseTimeDate(time: number) {
    const totalSec = Math.floor(time);
    const milliSec = time - totalSec;
    const sec = totalSec % 60;
    const min = Math.floor(totalSec / 60);
    let textMilliSec = `${milliSec}`.split(".")[1];
    if (!textMilliSec) textMilliSec = "00";
    else {
      textMilliSec = textMilliSec.slice(0, 2);
    }
    const textSec = sec < 10 ? `0${sec}` : `${sec}`;
    const textMin = min < 10 ? `0${min}` : `${min}`;

    return `${textMin}:${textSec}.${textMilliSec}`;
  }

  useEffect(() => {
    if (!isRepeat) return;
    setInitrepeatTimelineState();
  }, [videoRef, isRepeat]);

  useEffect(() => {
    setRepeatControllerPosition();
  }, [repeatTimelineState, repeatControllerState]);

  useEffect(() => {
    if (!isRepeat || videoRef === null) return undefined;
    repeatVideo();
    videoRef.addEventListener("playing", roopReatVideo);
    return () => videoRef.removeEventListener("playing", roopReatVideo);
  }, [repeatControllerState, isRepeat]);

  return (
    <div id="repeat">
      <div>
        <button type="button" onClick={clickRepeat}>
          구간반복 생성/삭제
        </button>
      </div>
      {isRepeat && (
        <>
          <div id="repeatBar" ref={repeatTimeLineRef}>
            <div
              id="repeatController"
              ref={repeatControllerRef}
              onKeyDown={(e) => {
                console.log(e.code);
              }}
              onMouseDown={mouseDownController}
              role="button"
              aria-label="repeat-item"
              tabIndex={0}
            >
              <div
                className="start"
                onKeyDown={(e) => {
                  console.log(e.code);
                }}
                onMouseDown={(e) => mouseDownControllerEdge(e, "start")}
                role="button"
                aria-label="repeat-starting-point"
                tabIndex={0}
              />
              <div
                className="end"
                onKeyDown={(e) => {
                  console.log(e.code);
                }}
                onMouseDown={(e) => mouseDownControllerEdge(e, "end")}
                role="button"
                aria-label="repeat-ending-point"
                tabIndex={0}
              />
            </div>
          </div>
          <div id="timeViewer">
            <p>{parseTimeDate(repeatTimelineState.startTime)}</p>
            <p>{parseTimeDate(repeatTimelineState.endTime)}</p>
          </div>
        </>
      )}
    </div>
  );
}

export default RepeatBar;
