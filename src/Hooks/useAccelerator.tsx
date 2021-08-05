function useAccelerator(
  currentPosition: number,
  speed: number,
  accelerate: number,
  updateCurrentPosition: (position: number) => void
) {
  const diff = 1000;
  let afterPosition = currentPosition;
  let afterSpeed = speed;
  function move() {
    afterPosition += afterSpeed;
    afterSpeed += accelerate;
    updateCurrentPosition(afterPosition);
  }

  return setInterval(move, diff);
}

export default useAccelerator;
