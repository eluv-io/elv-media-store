import React, {useEffect, useState} from "react";
import {observer} from "mobx-react";
import {Link, useRouteMatch} from "react-router-dom";
import {contentStore} from "../stores";
import {Initialize} from "@eluvio/elv-embed/src/Embed";
import UrlJoin from "url-join";

import {Button, ButtonWithMenu} from "Components/common/Button";
import ExpandableSection from "Components/common/ExpandableSection";
import ResponsiveEllipsis from "Components/common/ResponsiveEllipsis";
import {PageLoader} from "Components/common/Loader";
import Slider from "Components/common/Slider";
import ImageIcon from "Components/common/ImageIcon";

import ContractIcon from "Assets/icons/contract.svg";
import DescriptionIcon from "Assets/icons/description.svg";
import ShareIcon from "Assets/icons/share.svg";
import PlayIcon from "Assets/icons/play.svg";
import PlusIcon from "Assets/icons/plus.svg";
import ExternalLinkIcon from "Assets/icons/external-link.svg";
import TwitterIcon from "Assets/icons/twitter.svg";
import CopyIcon from "Assets/icons/copy.svg";

const VideoDetails = observer(() => {
  const match = useRouteMatch();
  const [loading, setLoading] = useState(false);
  const [targetElement, setTargetElement] = useState();
  const [player, setPlayer] = useState();

  useEffect(() => {
    const LoadTitle = async () => {
      try {
        setLoading(true);

        await contentStore.SetCurrentTitle({
          objectId: match.params.objectId
        });
      } finally {
        setLoading(false);
      }
    };

    LoadTitle();
    player && player.Destroy();
  }, []);

  useEffect(() => {
    if(!targetElement || !contentStore.currentVideo.embedUrl) { return; }

    const posterUrl = contentStore.currentVideo && contentStore.currentVideo.media_type === "Audio" && contentStore.currentVideo.imageUrl ? contentStore.currentVideo.imageUrl.toString() : undefined;
    Initialize({
      client: contentStore.client,
      target: targetElement,
      url: contentStore.currentVideo.embedUrl.toString(),
      playerOptions: {
        posterUrl,
        capLevelToPlayerSize: true
      }
    }).then(player => setPlayer(player));
  }, [targetElement]);

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
        <div className="card-container">
          <div className="item-card media-card">
            <div className="item-card__image-container">
              <div className="item-card__image item-card__image-video-embed">
                <div ref={element => setTargetElement(element)} className="item-card__image-video-embed__frame" />
              </div>
              <div className="item-card__image-container__actions">
                <a href={contentStore.currentVideo.embedUrl} target="_blank" className="item-card__image-container__action" title="Open Media in New Tab">
                  <ImageIcon icon={ExternalLinkIcon} label="Open Media"/>
                </a>
              </div>
            </div>
          </div>
        </div>

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

  const ShareActionsMenu = () => {
    const nftInfo = {mediaInfo: {requiresPermissions: false}}; // TODO: Temporary
    let twitterUrl;
    let listingId = match.params.objectId || contentStore.currentVideo.objectId;
    let shareUrl;
    if(listingId) {
      shareUrl = new URL(UrlJoin(window.location.origin, window.location.pathname));
      shareUrl.hash = match.params.marketplaceId ?
        UrlJoin("/marketplace", match.params.marketplaceId, "listings", listingId) :
        UrlJoin("/wallet", "listings", listingId);
    }

    if(shareUrl) {
      twitterUrl = new URL("https://twitter.com/share");
      twitterUrl.searchParams.set("url", shareUrl);
      twitterUrl.searchParams.set("text", `${contentStore.currentVideo.name}\n\n`);
    }

    // if(!shareUrl && !(nftInfo.mediaInfo && !nftInfo.mediaInfo.requiresPermissions)) {
    //   return null;
    // }

    return (
      <div className="details-page__nft-info__buttons">
        <ButtonWithMenu
          className="action details-page__nft-info__menu-button-container"
          buttonProps={{
            className: "details-page__nft-info__menu-button",
            children: <ImageIcon icon={ShareIcon} />
          }}
          RenderMenu={Close => (
            <>
              {
                twitterUrl ?
                  <a href={twitterUrl.toString()} target="_blank" onClick={Close}>
                    <ImageIcon icon={TwitterIcon}/>
                    Share on Twitter
                  </a> : null
              }
              {
                shareUrl ?
                  <button
                    onClick={() => {
                      Copy(shareUrl);
                      Close();
                    }}
                  >
                    <ImageIcon icon={CopyIcon}/>
                    Copy { listingId ? "Listing" : "Item" } URL
                  </button> : null
              }
              {
                nftInfo.mediaInfo && !nftInfo.mediaInfo.requiresPermissions ?
                  <button
                    onClick={() => {
                      Copy(nftInfo.mediaInfo.mediaLink || nftInfo.mediaInfo.embedUrl || nftInfo.mediaInfo.imageUrl);
                      Close();
                    }}
                  >
                    <ImageIcon icon={CopyIcon}/>
                    Copy Media URL
                  </button> : null
              }
            </>
          )}
        />
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
      renderedPrice: "24.95"
    }; // TODO: Temporary
    let sideText = nftInfo.sideText;
    if(nftInfo.stock) {
      sideText = [`${nftInfo.stock.minted} Minted`, `${nftInfo.stock.max - nftInfo.stock.minted} Available`];
    }

    return (
      <>
        { ShareActionsMenu() }
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
      <div className="content">
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
      </div>
    );
  };

  if(loading || contentStore.loadingCurrentTitle) { return <PageLoader />; }

  return contentStore.currentVideo ? DetailsView() : LibraryView();
});

export default VideoDetails;
