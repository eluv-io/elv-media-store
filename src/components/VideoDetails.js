import React, {useEffect, useState} from "react";
import EmbedPlayer from "Components/common/EmbedPlayer";
import {observer} from "mobx-react";
import {Link, useRouteMatch} from "react-router-dom";
import {contentStore} from "../stores";

import {Button} from "Components/common/Button";
import {IconButton} from "Components/common/Button";
import ExpandableSection from "Components/common/ExpandableSection";
import {PageLoader} from "Components/common/Loader";
import Slider from "Components/common/Slider";

import ContractIcon from "Assets/icons/contract.svg";
import DescriptionIcon from "Assets/icons/description.svg";
import SendIcon from "Assets/icons/send.svg";
import ShareIcon from "Assets/icons/share.svg";
import PlayIcon from "Assets/icons/play.svg";
import PlusIcon from "Assets/icons/plus.svg";
import ResponsiveEllipsis from "Components/common/ResponsiveEllipsis";

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

          { SliderContent() }
        </div>
      </div>
    );
  };

  const SliderContent = () => {
    if(!contentStore.seasonEpisodes) { return null; }

    return (
      <Slider
        items={contentStore.seasonEpisodes}
        OnClick={({objectId}) => contentStore.SetCurrentTitle({objectId})}
      />
    );
  };

  const MediaSection = () => {
    return (
      <div className="details-page__content-container">
        <EmbedPlayer
          src={contentStore.currentVideo.embedPlayerUrl}
        />

        <div className="details-page__actions">
          <Button variant="tertiary" icon={PlayIcon}>
            Watch For Free
          </Button>

          <Button variant="primary" icon={PlusIcon}>
            Mint Edition
          </Button>
        </div>
      </div>
    );
  };

  const InfoSection = () => {
    const nftInfo = {
      sideText: "",
      stock: {minted: 10, max: 600},
      item: {
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Egestas tristique est, natoque ut ullamcorper. Lacus et sed in pulvinar ac nec egestas..."
      },
      renderedPrice: "410"
    }; // TODO: Temporary
    let sideText = nftInfo.sideText;
    if(nftInfo.stock) {
      sideText = [`${nftInfo.stock.minted} Minted`, `${nftInfo.stock.max - nftInfo.stock.minted} Available`];
    }

    return (
      <>
        <div className="details-page__nft-info__buttons">
          <IconButton icon={SendIcon} />
          <IconButton icon={ShareIcon} title="Share" />
        </div>
        <div className="details-page__nft-info__name">
          { contentStore.currentVideo.display_title }
        </div>
        <div className="details-page__nft-info__subtitle-container">
          <div className="details-page__nft-info__edition">
            August 3
          </div>

          {
            sideText && !nftInfo.selectedMedia ?
              <div className="details-page__nft-info__token-container">
                <div className={`details-page__nft-info__token ${!nftInfo.stock ? "details-page__nft-info__token--highlight" : ""}`}>
                  {sideText[0]}
                </div>
                {
                  sideText[1] ?
                    <>
                      /&nbsp;
                      <div className={`details-page__nft-info__token ${nftInfo.stock ? "details-page__nft-info__token--highlight" : ""}`}>
                        {sideText[1]}
                      </div>
                    </> : null
                }
              </div> : null
          }
        </div>
        <ResponsiveEllipsis
          component="div"
          className="details-page__nft-info__description"
          text={nftInfo.item?.description || nftInfo.nft.metadata.description}
          maxLine={50}
        />
        {
          !nftInfo.selectedMedia && nftInfo.renderedPrice || nftInfo.status ?
            <div className="details-page__nft-info__status">
              {
                nftInfo.renderedPrice ?
                  <div className="details-page__nft-info__status__price">
                    USD ${nftInfo.renderedPrice}
                  </div> : null
              }
              {
                nftInfo.status ?
                  <div className="details-page__nft-info__status__text">
                    {nftInfo.status}
                  </div> : null
              }
            </div> : null
        }
      </>
    );
  };

  const DetailsSection = () => {
    return (
      <ExpandableSection header="Details" icon={DescriptionIcon}></ExpandableSection>
    );
  };

  const ContractSection = () => {
    return (
      <ExpandableSection header="Contract" icon={ContractIcon} className="no-padding"></ExpandableSection>
    );
  };

  const DetailsView = () => {
    return (
      <div className="details-page">
        <Link to={"/videos"} className="details-page__back-link">Back</Link>
        <div className="details-page__main-content">
          { MediaSection() }
          <div className="details-page__nft-info">
            { InfoSection() }
            { DetailsSection() }
            { ContractSection() }
          </div>
        </div>
      </div>
    );
  };

  if(loading || contentStore.loadingCurrentTitle) { return <PageLoader />; }

  return contentStore.currentVideo ? DetailsView() : LibraryView();
});

export default VideoDetails;
