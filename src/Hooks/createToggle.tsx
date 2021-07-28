import React from "react";

const CreateToggle = <P extends React.HTMLAttributes<P>>(
  WrappedComponent: React.ComponentType<P>,
  state: boolean,
  onAction: () => void,
  offAction: () => void
) => {
  function toggleAction() {
    if (state) onAction();
    else offAction();
  }

  return (props: P) => (
    <>
      <WrappedComponent {...props} onClick={toggleAction} />
    </>
  );
};

export default CreateToggle;
