import React from "react";

const EmbedPlayer = ({src}) => {
  return (
    <div className="embed-player-container">
      <iframe
        width="100%"
        height="100%"
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
