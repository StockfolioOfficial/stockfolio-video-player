import repeatStore from "contexts/repeatStore";
import React, { useContext, useEffect, useRef } from "react";
import "./RepeatBar.css";

interface RepeatBarProps {
  videoRef: HTMLVideoElement | null;
  moveCurrentTime: (time: number) => void;
}

function RepeatBar({ videoRef, moveCurrentTime }: RepeatBarProps) {
  const { state, action } = useContext(repeatStore);
  const { isRepeat, repeatControllerState, repeatOption, repeatViewState } =
    state;
  const { minTime, maxTime } = repeatOption;
  const { setRepeatControllerState, setRepeatViewState, setIsRepeat } = action;
  const repeatBarRef = useRef<HTMLDivElement | null>(null);
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

  function convertPositionToTime(
    targetPosition: number,
    startingPosition: number,
    endPosition: number
  ) {
    const { duration: repeatViewDuration, startTime: repeatViewStartTime } =
      repeatViewState;
    return (
      repeatViewDuration *
        ((targetPosition - startingPosition) /
          (endPosition - startingPosition)) +
      repeatViewStartTime
    );
  }

  function setInitRepeatViewState() {
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
    setRepeatViewState({
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
      repeatViewState;
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
      repeatBarRef.current === null
    )
      return;
    const { clientWidth: barWidth, offsetLeft: barLeft } = repeatBarRef.current;
    const { clientWidth: controllerWidth, offsetLeft: controllerLeft } =
      repeatControllerRef.current;
    const videoDuration = videoRef.duration;
    const controllerStartPosition = barLeft + controllerLeft;
    const controllerEndPosition = controllerStartPosition + controllerWidth;
    let accellorate: null | number = null;

    if (!videoRef.paused) videoRef.pause();

    function mouseMoveController(em: MouseEvent) {
      em.preventDefault();
      const afterStartPosition = em.pageX - e.nativeEvent.offsetX;
      const afterEndPosition =
        em.pageX - e.nativeEvent.offsetX + controllerWidth;
      const {
        startTime: barStartTime,
        endTime: barEndTime,
        duration: barDuration,
      } = repeatViewState;
      let overLength = 0;
      const finalStartPosition = barLeft;
      const finalEndPosition = barLeft + barWidth;
      if (afterStartPosition < barLeft) {
        overLength = barLeft - afterStartPosition;
        accellorate = (barDuration * overLength) / barWidth;
      }
      if (afterEndPosition > barLeft + barWidth) {
        overLength = afterEndPosition - barLeft - barWidth;
        accellorate = (barDuration * overLength) / barWidth;
      } else {
        accellorate = accellorate !== null ? null : accellorate;
      }
      // controllerStartPosition = accellorate === null ? afterStartPosition : ;
      // controllerEndPosition = afterEndPosition;

      // let finalStartTime = convertPositionToTime(
      //   controllerStartPosition,
      //   barLeft,
      //   barLeft + barWidth
      // );

      // let finalEndTime = convertPositionToTime(
      //   controllerEndPosition,
      //   barLeft,
      //   barLeft + barWidth
      // );

      // if (finalStartTime < 0) {
      //   finalStartTime = 0;
      //   finalEndTime = repeatControllerState.endTime - repeatControllerState.startTime;
      // }

      // if (finalEndTime > videoDuration) {
      //   finalEndTime = videoDuration;
      //   finalStartTime =
      //     videoDuration - repeatControllerState.endTime + repeatControllerState.startTime;
      // }

      // setrepeatControllerState({
      //   startTime: finalStartTime,
      //   endTime: finalEndTime,
      // });
      // moveCurrentTime(
      //   convertPositionToTime(
      //     (controllerStartPosition + controllerEndPosition) / 2,
      //     barLeft,
      //     barLeft + barWidth
      //   )
      // );
    }

    function mouseUpController() {
      document.removeEventListener("mousemove", mouseMoveController);
      document.removeEventListener("mouseup", mouseUpController);
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
      repeatBarRef.current === null
    )
      return;
    if (e.currentTarget !== e.target) return;
    const { clientWidth: barWidth, offsetLeft: barLeft } = repeatBarRef.current;
    const { clientWidth: controllerWidth, offsetLeft: controllerLeft } =
      repeatControllerRef.current;
    const {
      startTime: repeatBarStartTime,
      endTime: repeatBarEndTime,
      duration: repeatDuration,
    } = repeatViewState;
    const minLength =
      barWidth * (minTime / repeatDuration - repeatBarStartTime);
    const maxLength =
      barWidth * (maxTime / repeatDuration - repeatBarStartTime);
    let edgePosition = 0;
    let pointerToEdge = 0;
    let limitStart = barLeft;
    let limitEnd = barLeft + barWidth;

    if (!videoRef.paused) videoRef.pause();

    if (target === "start") {
      edgePosition = barLeft + controllerLeft;
      pointerToEdge = e.pageX - edgePosition;
      const demoLimitStart = edgePosition + controllerWidth - maxLength;
      limitStart = demoLimitStart < limitStart ? limitStart : demoLimitStart;
      limitEnd = edgePosition + controllerWidth - minLength;
    } else {
      edgePosition = barLeft + controllerLeft + controllerWidth;
      pointerToEdge = edgePosition - e.pageX;
      const demoLimitEnd = edgePosition - controllerWidth + maxLength;
      limitEnd = demoLimitEnd > limitEnd ? limitEnd : demoLimitEnd;
      limitStart = edgePosition - controllerWidth + minLength;
    }

    function mouseMoveEdge(em: MouseEvent) {
      em.preventDefault();
      let afterEdgePoint =
        target === "start"
          ? em.pageX - pointerToEdge
          : em.pageX + pointerToEdge;

      if (afterEdgePoint > limitEnd) afterEdgePoint = limitEnd;
      if (afterEdgePoint < limitStart) afterEdgePoint = limitStart;
      if (afterEdgePoint === edgePosition) return;
      edgePosition = afterEdgePoint;
      const convertedTime = convertPositionToTime(
        edgePosition,
        barLeft,
        barLeft + barWidth
      );
      let finalTime = 0;
      if (target === "start") {
        finalTime =
          convertedTime < repeatBarStartTime
            ? repeatBarStartTime
            : convertedTime;
        setRepeatControllerState({
          ...repeatControllerState,
          startTime: finalTime,
        });
      } else {
        finalTime =
          convertedTime > repeatBarEndTime ? repeatBarEndTime : convertedTime;
        setRepeatControllerState({
          ...repeatControllerState,
          endTime: finalTime,
        });
      }
      moveCurrentTime(finalTime);
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
    setInitRepeatViewState();
  }, [videoRef, isRepeat]);

  useEffect(() => {
    setRepeatControllerPosition();
  }, [repeatViewState, repeatControllerState]);

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
          <div id="repeatBar" ref={repeatBarRef}>
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
            <p>{parseTimeDate(repeatViewState.startTime)}</p>
            <p>{parseTimeDate(repeatViewState.endTime)}</p>
          </div>
        </>
      )}
    </div>
  );
}

export default RepeatBar;
