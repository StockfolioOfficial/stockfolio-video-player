import React, { useEffect, useRef } from "react";
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
  minTime: number;
  videoRef: HTMLVideoElement | null;
  moveCurrentTime: (time: number) => void;
}

function RepeatBar({
  repeatTime,
  setRepeatTime,
  minTime,
  videoRef,
  moveCurrentTime,
}: RepeatBarProps) {
  const repeatBarRef = useRef<HTMLDivElement | null>(null);
  const repeatItemRef = useRef<HTMLDivElement | null>(null);

  function setVideoCurrentTime() {
    if (videoRef === null) return;
    const { startTime, endTime } = repeatTime;
    if (videoRef.currentTime < startTime) moveCurrentTime(startTime);
    if (videoRef.currentTime > endTime) moveCurrentTime(endTime);
  }

  function repeatVideo() {
    const { startTime, endTime } = repeatTime;
    if (videoRef === null) return;
    if (videoRef.currentTime > endTime) moveCurrentTime(startTime);

    if (!videoRef.paused) window.requestAnimationFrame(repeatVideo);
  }

  function changeItemPosition() {
    const { startTime, endTime } = repeatTime;
    if (videoRef === null || repeatItemRef.current === null) return;
    const { current: $item } = repeatItemRef;
    $item.style.left = `${(startTime / videoRef.duration) * 100}%`;
    $item.style.width = `${((endTime - startTime) / videoRef.duration) * 100}%`;
  }

  function mouseDownEdge(
    e: React.MouseEvent<HTMLDivElement>,
    target: "start" | "end"
  ) {
    if (
      videoRef === null ||
      repeatItemRef.current === null ||
      repeatBarRef.current === null
    )
      return;
    if (e.currentTarget !== e.target) return;
    const { clientWidth: barWidth, offsetLeft: barLeft } = repeatBarRef.current;
    const { clientWidth: itemWidth, offsetLeft: itemLeft } =
      repeatItemRef.current;
    const { duration } = videoRef;
    const minLength = (barWidth * minTime) / duration;
    let edgePoint = 0;
    let pointerToEdge = 0;
    let limitStart = barLeft;
    let limitEnd = barLeft + barWidth;

    if (!videoRef.paused) videoRef.pause();

    if (target === "start") {
      edgePoint = barLeft + itemLeft;
      pointerToEdge = e.pageX - edgePoint;
      limitEnd = edgePoint + itemWidth - minLength;
    } else {
      edgePoint = barLeft + itemLeft + itemWidth;
      pointerToEdge = edgePoint - e.pageX;
      limitStart = edgePoint - itemWidth + minLength;
    }

    function mouseMoveEdge(em: MouseEvent) {
      let afterEdgePoint =
        target === "start"
          ? em.pageX - pointerToEdge
          : em.pageX + pointerToEdge;
      if (afterEdgePoint < limitStart) afterEdgePoint = limitStart;
      if (afterEdgePoint > limitEnd) afterEdgePoint = limitEnd;
      if (afterEdgePoint === edgePoint) return;
      edgePoint = afterEdgePoint;

      const changeTime = duration * ((edgePoint - barLeft) / barWidth);
      if (target === "start") {
        setRepeatTime({ ...repeatTime, startTime: changeTime });
      } else {
        setRepeatTime({ ...repeatTime, endTime: changeTime });
      }
      moveCurrentTime(changeTime);
    }

    function mouseUpEdge() {
      document.removeEventListener("mousemove", mouseMoveEdge);
      document.removeEventListener("mouseup", mouseUpEdge);
    }

    document.addEventListener("mousemove", mouseMoveEdge);
    document.addEventListener("mouseup", mouseUpEdge);
  }

  function mouseDownItem(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target !== e.currentTarget) return;
    if (
      videoRef === null ||
      repeatItemRef.current === null ||
      repeatBarRef.current === null
    )
      return;
    const { clientWidth: barWidth, offsetLeft: barLeft } = repeatBarRef.current;
    const { clientWidth: itemWidth, offsetLeft: itemLeft } =
      repeatItemRef.current;
    const { duration } = videoRef;
    let itemStart = barLeft + itemLeft;
    let itemEnd = itemStart + itemWidth;

    if (!videoRef.paused) videoRef.pause();

    function mouseMoveItem(em: MouseEvent) {
      let afterStart = em.pageX - e.nativeEvent.offsetX;
      let afterEnd = em.pageX - e.nativeEvent.offsetX + itemWidth;

      if (afterStart < barLeft) {
        afterStart = barLeft;
        afterEnd = barLeft + itemWidth;
      }
      if (afterEnd > barLeft + barWidth) {
        afterStart = barLeft + barWidth - itemWidth;
        afterEnd = barLeft + barWidth;
      }

      if (itemStart === afterStart || itemEnd === afterEnd) return;
      itemStart = afterStart;
      itemEnd = afterEnd;

      setRepeatTime({
        startTime: duration * ((itemStart - barLeft) / barWidth),
        endTime: duration * ((itemEnd - barLeft) / barWidth),
      });
      moveCurrentTime(duration * ((itemStart - barLeft) / barWidth));
    }

    function mouseUpItem() {
      document.removeEventListener("mousemove", mouseMoveItem);
      document.removeEventListener("mouseup", mouseUpItem);
    }

    document.addEventListener("mousemove", mouseMoveItem);
    document.addEventListener("mouseup", mouseUpItem);
  }

  useEffect(() => {
    if (videoRef === null) return;
    setVideoCurrentTime();
  }, [videoRef]);

  useEffect(() => {
    if (videoRef === null || repeatItemRef.current === null) return undefined;
    changeItemPosition();
    videoRef.addEventListener("playing", repeatVideo);
    return () => {
      videoRef.removeEventListener("playing", repeatVideo);
    };
  }, [repeatTime, videoRef, repeatItemRef]);

  return (
    <div id="RepeatBar" ref={repeatBarRef}>
      <div
        className="RepeatItem"
        ref={repeatItemRef}
        onKeyDown={(e) => {
          console.log(e.code);
        }}
        onMouseDown={(e) => mouseDownItem(e)}
        role="button"
        aria-label="repeat-item"
        tabIndex={0}
      >
        <div
          className="start"
          onKeyDown={(e) => {
            console.log(e.code);
          }}
          onMouseDown={(e) => mouseDownEdge(e, "start")}
          role="button"
          aria-label="repeat-starting-point"
          tabIndex={0}
        />
        <div
          className="end"
          onKeyDown={(e) => {
            console.log(e.code);
          }}
          onMouseDown={(e) => mouseDownEdge(e, "end")}
          role="button"
          aria-label="repeat-ending-point"
          tabIndex={0}
        />
      </div>
    </div>
  );
}

export default RepeatBar;
