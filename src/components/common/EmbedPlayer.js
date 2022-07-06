import React from "react";

const EmbedPlayer = ({src, width="854", height="480"}) => {
  return (
    <div className="embed-player-container">
      <iframe
        width={width}
        height={height}
        scrolling="no"
        marginHeight="0"
        marginWidth="0"
        frameBorder="0"
        type="text/html"
        src={src}
      />
    </div>
  );
};

export default EmbedPlayer;
