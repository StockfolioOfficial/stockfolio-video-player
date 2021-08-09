import React, { useEffect, useRef, useState } from "react";
import "./RepeatBar.css";

interface RepeatBarProps {
  repeatTime: {
    startTime: number;
    endTime: number;
  };
  setRepeatTime: React.Dispatch<
    React.SetStateAction<{
      startTime: number;
      endTime: number;
    }>
  >;
  videoRef: HTMLVideoElement | null;
  moveCurrentTime: (time: number) => void;
  repeatOtion: {
    minTime: number;
    maxTime: number;
  };
}

function RepeatBar({
  repeatTime,
  setRepeatTime,
  videoRef,
  moveCurrentTime,
  repeatOtion,
}: RepeatBarProps) {
  const { minTime, maxTime } = repeatOtion;

  const repeatBarRef = useRef<HTMLDivElement | null>(null);
  const repeatControllerRef = useRef<HTMLDivElement | null>(null);
  const [repeatBarState, setRepeatBarState] = useState<{
    startTime: number;
    endTime: number;
    duration: number;
  }>({
    startTime: 0,
    endTime: 0,
    duration: 0,
  });

  function initRepeatSetting() {
    if (videoRef === null) return;
    const { duration, currentTime } = videoRef;
    let repeatBarDuration: number = maxTime * 3;

    if (repeatBarDuration > duration) repeatBarDuration = duration;
    let repeatBarStartTime = currentTime - repeatBarDuration / 2 + minTime / 2;
    let repeatBarEndTime = currentTime + repeatBarDuration / 2 + minTime / 2;
    if (repeatBarStartTime < 0) {
      repeatBarStartTime = 0;
      repeatBarEndTime = repeatBarDuration;
    }

    if (repeatBarEndTime > duration) {
      repeatBarStartTime = duration - repeatBarDuration;
      repeatBarEndTime = duration;
    }
    setRepeatBarState({
      startTime: repeatBarStartTime,
      endTime: repeatBarEndTime,
      duration: repeatBarDuration,
    });
  }

  function convertPositionToTime(
    position: number,
    startPosition: number,
    endPosition: number
  ) {
    const { duration: repeatBarDuration, startTime: repeatBarStartTime } =
      repeatBarState;
    return (
      repeatBarDuration *
        ((position - startPosition) / (endPosition - startPosition)) +
      repeatBarStartTime
    );
  }

  function setRepeatControllerPosition() {
    const { startTime, endTime } = repeatTime;
    if (repeatControllerRef.current === null) return;
    const { current: $controller } = repeatControllerRef;
    const { startTime: repeatBarStartTime, duration: repeatBarDuration } =
      repeatBarState;
    $controller.style.left = `${
      ((startTime - repeatBarStartTime) / repeatBarDuration) * 100
    }%`;
    $controller.style.width = `${
      ((endTime - startTime) / repeatBarDuration) * 100
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
    let controllerStartPosition = barLeft + controllerLeft;
    let controllerEndPosition = controllerStartPosition + controllerWidth;

    if (!videoRef.paused) videoRef.pause();

    function mouseMoveController(em: MouseEvent) {
      em.preventDefault();
      let afterStartPosition = em.pageX - e.nativeEvent.offsetX;
      let afterEndPosition = em.pageX - e.nativeEvent.offsetX + controllerWidth;
      if (afterStartPosition < barLeft) {
        afterStartPosition = barLeft;
        afterEndPosition = barLeft + controllerWidth;
      }
      if (afterEndPosition > barLeft + barWidth) {
        afterStartPosition = barLeft + barWidth - controllerWidth;
        afterEndPosition = barLeft + barWidth;
      }
      if (
        controllerStartPosition === afterStartPosition ||
        controllerEndPosition === afterEndPosition
      )
        return;
      controllerStartPosition = afterStartPosition;
      controllerEndPosition = afterEndPosition;

      setRepeatTime({
        startTime: convertPositionToTime(
          controllerStartPosition,
          barLeft,
          barLeft + barWidth
        ),
        endTime: convertPositionToTime(
          controllerEndPosition,
          barLeft,
          barLeft + barWidth
        ),
      });
      moveCurrentTime(
        convertPositionToTime(
          (controllerStartPosition + controllerEndPosition) / 2,
          barLeft,
          barLeft + barWidth
        )
      );
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
    } = repeatBarState;
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
        setRepeatTime({
          ...repeatTime,
          startTime: finalTime,
        });
      } else {
        finalTime =
          convertedTime > repeatBarEndTime ? repeatBarEndTime : convertedTime;
        setRepeatTime({
          ...repeatTime,
          endTime: finalTime,
        });
      }
      // moveCurrentTime(finalTime);
    }

    function mouseUpEdge() {
      document.removeEventListener("mousemove", mouseMoveEdge);
      document.removeEventListener("mouseup", mouseUpEdge);
    }

    document.addEventListener("mousemove", mouseMoveEdge);
    document.addEventListener("mouseup", mouseUpEdge);
  }

  // function setVideoCurrentTime() {
  //   if (videoRef === null) return;
  //   const { startTime, endTime } = repeatTime;
  //   if (videoRef.currentTime < startTime) moveCurrentTime(startTime);
  //   if (videoRef.currentTime > endTime) moveCurrentTime(endTime);
  // }
  // function repeatVideo() {
  //   const { startTime, endTime } = repeatTime;
  //   if (videoRef === null) return;
  //   if (videoRef.currentTime > endTime) moveCurrentTime(startTime);
  //   if (!videoRef.paused) window.requestAnimationFrame(repeatVideo);
  // }
  // function mouseDownEdge(
  //   e: React.MouseEvent<HTMLDivElement>,
  //   target: "start" | "end"
  // ) {
  //   if (
  //     videoRef === null ||
  //     repeatControllerRef.current === null ||
  //     repeatBarRef.current === null
  //   )
  //     return;
  //   if (e.currentTarget !== e.target) return;
  //   const { clientWidth: barWidth, offsetLeft: barLeft } = repeatBarRef.current;
  //   const { clientWidth: itemWidth, offsetLeft: itemLeft } =
  //     repeatControllerRef.current;
  //   const { duration } = videoRef;
  //   const minLength = (barWidth * minTime) / duration;
  //   let edgePoint = 0;
  //   let pointerToEdge = 0;
  //   let limitStart = barLeft;
  //   let limitEnd = barLeft + barWidth;
  //   if (!videoRef.paused) videoRef.pause();
  //   if (target === "start") {
  //     edgePoint = barLeft + itemLeft;
  //     pointerToEdge = e.pageX - edgePoint;
  //     limitEnd = edgePoint + itemWidth - minLength;
  //   } else {
  //     edgePoint = barLeft + itemLeft + itemWidth;
  //     pointerToEdge = edgePoint - e.pageX;
  //     limitStart = edgePoint - itemWidth + minLength;
  //   }
  //   function mouseMoveEdge(em: MouseEvent) {
  //     let afterEdgePoint =
  //       target === "start"
  //         ? em.pageX - pointerToEdge
  //         : em.pageX + pointerToEdge;
  //     if (afterEdgePoint < limitStart) afterEdgePoint = limitStart;
  //     if (afterEdgePoint > limitEnd) afterEdgePoint = limitEnd;
  //     if (afterEdgePoint === edgePoint) return;
  //     edgePoint = afterEdgePoint;
  //     const changeTime = duration * ((edgePoint - barLeft) / barWidth);
  //     if (target === "start") {
  //       setRepeatTime({ ...repeatTime, startTime: changeTime });
  //     } else {
  //       setRepeatTime({ ...repeatTime, endTime: changeTime });
  //     }
  //     moveCurrentTime(changeTime);
  //   }
  //   function mouseUpEdge() {
  //     document.removeEventListener("mousemove", mouseMoveEdge);
  //     document.removeEventListener("mouseup", mouseUpEdge);
  //   }
  //   document.addEventListener("mousemove", mouseMoveEdge);
  //   document.addEventListener("mouseup", mouseUpEdge);
  // }

  // useEffect(() => {
  // if (videoRef === null || repeatControllerRef.current === null) return undefined;
  // const { startTime, endTime } = repeatTime;
  // const { minTime, maxTime } = repeatOtion;
  // }, [videoRef, repeatControllerRef]);

  // useEffect(() => {
  // if (videoRef === null || repeatControllerRef.current === null) return undefined;
  // changeItemPosition();
  // videoRef.addEventListener("playing", repeatVideo);
  // return () => {
  //   videoRef.removeEventListener("playing", repeatVideo);
  // };
  // }, [videoRef, repeatTime, repeatControllerRef]);

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
    initRepeatSetting();
  }, [videoRef]);

  useEffect(() => {
    setRepeatControllerPosition();
  }, [repeatBarState]);

  useEffect(() => {
    setRepeatControllerPosition();
  }, [repeatTime]);

  return (
    <div id="repeat">
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
        <p>{parseTimeDate(repeatBarState.startTime)}</p>
        <p>{parseTimeDate(repeatBarState.endTime)}</p>
      </div>
    </div>
  );
}

export default RepeatBar;
