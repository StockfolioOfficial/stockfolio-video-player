function useConstant(
  currentPosition: number,
  speed: number,
  updateCurrentPosition: (position: number) => void
) {
  const diff = 1000;
  let afterPosition = currentPosition;
  function move() {
    afterPosition += speed;
    updateCurrentPosition(afterPosition);
  }

  return setInterval(move, diff);
}

export default useConstant;
