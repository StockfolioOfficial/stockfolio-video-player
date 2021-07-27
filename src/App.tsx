import React, { ReactElement, useRef } from "react";
import "./App.css";

function App(): ReactElement {
  const videoRef = useRef<null | HTMLVideoElement>(null);
  return (
    <div className="App">
      <video ref={videoRef} muted>
        <source
          id="mp4"
          src="https://ak.picdn.net/shutterstock/videos/1056468215/preview/stock-footage-top-view-of-drop-falls-into-water-and-diverging-circles-of-water-on-white-background-in-slow-motion.webm"
          type="video/webm"
        />
      </video>
    </div>
  );
}

export default App;
