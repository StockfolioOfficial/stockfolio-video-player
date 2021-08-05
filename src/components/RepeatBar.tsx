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
    let repeatBarStartTime = currentTime - repeatBarDuration / 2;
    let repeatBarEndTime = currentTime + repeatBarDuration / 2;

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
    const { duration } = videoRef;
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
      const { startTime: repeatBarStartTime } = repeatBarState;

      function convertPositionToTime(position: number) {
        return (
          (duration - repeatBarStartTime) * ((position - barLeft) / barWidth) +
          repeatBarStartTime
        );
      }

      setRepeatTime({
        startTime: convertPositionToTime(controllerStartPosition),
        endTime: convertPositionToTime(controllerEndPosition),
      });
      moveCurrentTime(
        convertPositionToTime(
          (controllerStartPosition + controllerEndPosition) / 2
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
    const { startTime: repeatBarStartTime } = repeatBarState;
    const { duration } = videoRef;
    const minLength = barWidth * (minTime / duration - repeatBarStartTime);
    let edgePosition = 0;
    let pointerToEdge = 0;
    let limitStart = barLeft;
    let limitEnd = barLeft + barWidth;

    if (!videoRef.paused) videoRef.pause();

    if (target === "start") {
      edgePosition = barLeft + controllerLeft;
      pointerToEdge = e.pageX - edgePosition;
      limitEnd = edgePosition + controllerWidth - minLength;
    } else {
      edgePosition = barLeft + controllerLeft + controllerWidth;
      pointerToEdge = edgePosition - e.pageX;
      limitStart = edgePosition - controllerWidth + minLength;
    }

    function mouseMoveEdge(em: MouseEvent) {
      em.preventDefault();
      let afterEdgePoint =
        target === "start"
          ? em.pageX - pointerToEdge
          : em.pageX + pointerToEdge;
      if (afterEdgePoint < limitStart) afterEdgePoint = limitStart;
      if (afterEdgePoint > limitEnd) afterEdgePoint = limitEnd;
      if (afterEdgePoint === edgePosition) return;
      edgePosition = afterEdgePoint;

      const convertedTime =
        (duration - repeatBarState.startTime) *
          ((edgePosition - barLeft) / barWidth) +
        repeatBarState.startTime;
      if (target === "start") {
        setRepeatTime({ ...repeatTime, startTime: convertedTime });
      } else {
        setRepeatTime({ ...repeatTime, endTime: convertedTime });
      }
      moveCurrentTime(convertedTime);
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

  useEffect(() => initRepeatSetting(), [repeatOtion]);

  useEffect(() => setRepeatControllerPosition(), [repeatBarState]);

  return (
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
  );
}

export default RepeatBar;
