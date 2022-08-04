import React, {useEffect, useState} from "react";
import EmbedPlayer from "Components/common/EmbedPlayer";
import {observer} from "mobx-react";
import {Link, useRouteMatch} from "react-router-dom";
import {contentStore} from "../stores";

import {Button} from "Components/common/Button";
import {IconButton} from "Components/common/Button";
import ExpandableSection from "Components/common/ExpandableSection";

import ContractIcon from "Assets/icons/contract.svg";
import DescriptionIcon from "Assets/icons/description.svg";
import SendIcon from "Assets/icons/send.svg";
import ShareIcon from "Assets/icons/share.svg";
import PlayIcon from "Assets/icons/play.svg";
import PlusIcon from "Assets/icons/plus.svg";
import {PageLoader} from "Components/common/Loader";
import Card from "Components/common/Card";

const VideoDetails = observer(() => {
  const match = useRouteMatch();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const LoadTitle = async () => {
      try {
        setLoading(true);

        await contentStore.SetCurrentTitle({
          objectId: match.params.mediaId
        });
      } finally {
        setLoading(false);
      }
    };

    LoadTitle();
  }, []);

  const LibraryView = () => {
    if(!contentStore.seasons) { return null; }

    return (
      <div className="video-library-page">
        <div className="lists-container">
          <Link to="/videos">Back</Link>
          <div className="seasons__dropdown">
            <div>Seasons</div>
            <select onChange={async (event) => await contentStore.LoadSeasonEpisodes({objectId: event.target.value})}>
              {
                contentStore.seasons.map(({display_title, objectId}) => (
                  <option key={objectId} value={objectId}>
                    {display_title}
                  </option>
                ))
              }
            </select>
          </div>

          { Cards() }
        </div>
      </div>
    );
  };

  const Cards = () => {
    if(!contentStore.seasonEpisodes) { return null; }

    return (
      <div className="cards-grid">
        {
          contentStore.seasonEpisodes.map(({objectId, imageUrl, title}) => (
            <button key={objectId} onClick={() => contentStore.SetCurrentTitle({objectId})}>
              <Card
                image={imageUrl}
                title={title}
              />
            </button>
          ))
        }
      </div>
    );
  };

  const DetailsView = () => {
    return (
      <div className="video-details-page">
        <Link to={"/videos"}>Back</Link>

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
              <IconButton icon={ShareIcon} title="Share" />
            </div>
            <div className="video-details__info">
              <h2>{contentStore.currentVideo.display_title}</h2>
              <p className="video-details__text video-details__text--flex">
                <span>AUGUST 3</span>
                <span>390 MINTED/500 AVAILABLE</span>
              </p>
              {
                contentStore.currentVideo.description &&
                <p className="video-details__text">{contentStore.currentVideo.description}</p>
              }
              <p className="video-details__text">USD $24.95</p>

              <ExpandableSection header="Details" icon={DescriptionIcon}>Description</ExpandableSection>
              <ExpandableSection header="Contract" icon={ContractIcon}>Contract</ExpandableSection>
            </div>
          </div>

        </div>
      </div>
    );
  };

  if(loading) { return <PageLoader />; }

  return contentStore.currentVideo ? DetailsView() : LibraryView();
});

export default VideoDetails;
