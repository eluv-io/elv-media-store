import React from "react";
import {observer} from "mobx-react";
import {contentStore} from "../stores";
import Card from "Components/common/Card";
import EmbedPlayer from "Components/common/EmbedPlayer";
import {Link} from "react-router-dom";
import {PageLoader} from "Components/common/Loader";

const VideoLibrary = observer(() => {
  if(!contentStore.loaded) { return <PageLoader />; }

  const lists = [
    {name: "Titles", metadataKey: "titles"},
    {name: "Episodes", metadataKey: "episodes"},
    {name: "Series", metadataKey: "series"},
    {name: "Seasons", metadataKey: "seasons"},
    {name: "Trailers", metadataKey: "trailers"},
    {name: "Channels", metadataKey: "channels"}
  ];

  const Cards = ({path}) => {
    const metadataKey = path.shift();
    const cardObjects = path.reduce(((previousValue, currentValue) => previousValue[currentValue]), contentStore[metadataKey]);

    return (
      <div className="cards-grid">
        {
          cardObjects.map(({objectId, imageUrl, title}) => (
            <Link
              key={objectId}
              to={`/videos/${objectId}`}
            >
              <Card
                image={imageUrl}
                title={title}
                OnClick={async () => {
                }}
              />
            </Link>
          ))
        }
      </div>
    );
  };

  const Content = () => {
    return lists.map(({name, metadataKey}) => {
      const hasContent = contentStore[metadataKey] && contentStore[metadataKey].length > 0;
      if(!hasContent) { return null; }

      return (
        <div key={metadataKey}>
          <h1>{ name }</h1>
          { Cards({path: [metadataKey]}) }
        </div>
      );
    });
  };

  const Playlists = () => {
    if(!contentStore.playlists || contentStore.playlists.length === 0) { return null; }

    return contentStore.playlists.map(({playlistId, name, titles}, index) => {
      return (
        <div key={playlistId}>
          <h1>{ name }</h1>
          { Cards({path: ["playlists", index, "titles"], objects: titles, playlistIndex: index}) }
        </div>
      );
    });
  };

  const PageContent = () => {
    return (
      <div className="video-library-page">
        <button className="" type="button" onClick={() => {}}>Back</button>

        {
          contentStore.currentVideo && <EmbedPlayer
            src={contentStore.currentVideo.embedPlayerUrl}
            width="80%"
          />
        }

        <div className="lists-container">
          { Playlists() }
          { Content() }
          <button type="button" onClick={() => rootStore.Authenticate()}>Log in</button>
        </div>
      </div>
    );
  };

  return <PageContent />;
});

export default VideoLibrary;
