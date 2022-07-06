import React, {useState} from "react";
import * as AspectRatio from "@radix-ui/react-aspect-ratio";

const Card = ({image, title, OnClick, ratio=(16 / 9)}) => {
  const [loading, setLoading] = useState(false);

  return (
    <div className={"card-container"} onClick={OnClick}>
      <AspectRatio.Root ratio={ratio}>
        <img
          className={`image-${loading ? "hidden" : "visible"}`}
          src={image}
          onLoad={() => setLoading(false)}
          alt={title}
        />
      </AspectRatio.Root>
    </div>
  );
};

export default Card;
