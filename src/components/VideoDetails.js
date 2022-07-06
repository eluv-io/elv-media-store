import React from "react";
import EmbedPlayer from "Components/common/EmbedPlayer";
import {observer} from "mobx-react";
import {useHistory} from "react-router-dom";
import {contentStore} from "../stores";

import {PageLoader} from "Components/common/Loader";
import {Button} from "Components/common/Button";
import {IconButton} from "Components/common/Button";

import SendIcon from "Assets/icons/send.svg";
import ShareIcon from "Assets/icons/share.svg";
import PlayIcon from "Assets/icons/play.svg";
import PlusIcon from "Assets/icons/plus.svg";

const VideoDetails = observer(() => {
  const history = useHistory();
  if(!contentStore.currentVideo) { return <PageLoader />; }

  return (
    <div className="video-details-page">
      <button type="button" onClick={() => history.goBack()}>Back</button>

      <div className="video-details-content">
        <div className="video-details__column">
          <div className="video-details__actions">
            <Button variant="tertiary" icon={PlayIcon}>
              Watch For Free
            </Button>

            <Button variant="primary" icon={PlusIcon}>
              Mint Edition
            </Button>
          </div>
          <EmbedPlayer
            src={contentStore.currentVideo.embedPlayerUrl}
            width="500px"
            height="560px"
          />
        </div>

        <div className="video-details__column video-details__right-column">
          <div></div>
          <div className="video-details__share-actions">
            <IconButton icon={SendIcon} />
            <IconButton icon={ShareIcon} />
          </div>
          <div className="video-details__info">
            <h2>{contentStore.currentVideo.display_title}</h2>
            <span>AUGUST 3</span>
            <p>390 MINTED/500 AVAILABLE</p>
            <p>Description</p>
            <p>USD $24.95</p>
          </div>
        </div>

      </div>
    </div>
  );
});

export default VideoDetails;
