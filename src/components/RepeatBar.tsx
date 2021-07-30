import React, { useEffect, useRef, useState } from "react";
import "./RepeatBar.css";

interface RepeatBarProps {
  videoRef: HTMLVideoElement | null;
  moveCurrentTime: (time: number) => void;
}

function RepeatBar({ videoRef, moveCurrentTime }: RepeatBarProps) {
  const minTime = 1;
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0 + minTime);
  const repeatBarRef = useRef<HTMLDivElement | null>(null);
  const repeatItemRef = useRef<HTMLDivElement | null>(null);

  function repeatVideo() {
    if (videoRef === null) return;
    if (videoRef.currentTime < startTime || videoRef.currentTime >= endTime)
      moveCurrentTime(startTime);

    if (!videoRef.paused) window.requestAnimationFrame(repeatVideo);
  }

  function changeItemPosition() {
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
    e.stopPropagation();
    const { clientWidth: barWidth, offsetLeft: barLeft } = repeatBarRef.current;
    const { clientWidth: itemWidth, offsetLeft: itemLeft } =
      repeatItemRef.current;
    const { duration } = videoRef;
    const minLength = (barWidth * minTime) / duration;
    let edgePoint =
      target === "start" ? barLeft + itemLeft : barLeft + itemLeft + itemWidth;
    const pointerToEdge =
      target === "start" ? e.pageX - edgePoint : edgePoint - e.pageX;
    let limitStart = barLeft;
    let limitEnd = barLeft + barWidth;

    if (target === "start") limitEnd = edgePoint + itemWidth - minLength;
    else limitStart = edgePoint - itemWidth + minLength;

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
        setStartTime(changeTime);
      } else {
        setEndTime(changeTime);
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

      setStartTime(duration * ((itemStart - barLeft) / barWidth));
      setEndTime(duration * ((itemEnd - barLeft) / barWidth));
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
    function initSetPosition() {
      if (videoRef === null) return;
      if (videoRef.currentTime < startTime) moveCurrentTime(startTime);
      if (videoRef.currentTime > endTime) moveCurrentTime(endTime);
      changeItemPosition();
      videoRef.removeEventListener("canplay", initSetPosition);
    }
    videoRef.addEventListener("canplay", initSetPosition);
  }, [videoRef]);

  useEffect(() => {
    if (videoRef === null || repeatItemRef.current === null) return undefined;
    changeItemPosition();
    videoRef.addEventListener("timeupdate", repeatVideo);
    repeatVideo();
    return () => {
      videoRef.removeEventListener("timeupdate", repeatVideo);
    };
  }, [startTime, endTime, videoRef, repeatItemRef]);

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
