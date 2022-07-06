import React, {useEffect, useState} from "react";
import {observer} from "mobx-react";
import {useRouteMatch} from "react-router-dom";
import {PageLoader} from "Components/common/Loader";
import {contentStore, rootStore} from "../stores";

const VideoWrapper = observer(({children}) => {
  const [loading, setLoading] = useState(false);
  const match = useRouteMatch();

  if(loading) { return <PageLoader />; }

  const LoadAssets = async () => {
    try {
      await contentStore.LoadAssets({objectId: rootStore.objectId});
    } catch(error) {
      // eslint-disable-next-line no-console
      console.error("Failed to load site:", rootStore.objectId);
      // eslint-disable-next-line no-console
      console.error(error);
    }
  };

  const LoadVideo = async () => {
    try {
      const object = await rootStore.client.ContentObjectMetadata({
        objectId: match.params.mediaId,
        libraryId: await rootStore.client.ContentObjectLibraryId({objectId: match.params.mediaId}),
        metadataSubtree: "public",
        select: [
          "description",
          "asset_metadata"
        ]
      });

      await contentStore.SetCurrentTitle({
        title: Object.assign(
          object.asset_metadata, {description: object.description}
        )
      });
    } catch(error) {
      // eslint-disable-next-line no-console
      console.error("Failed to set active title:");
      // eslint-disable-next-line no-console
      console.error(error);
    }
  };

  useEffect(() => {
    setLoading(true);
    try {
      LoadAssets();

      if(match.params.mediaId) {
        LoadVideo();
      }
    } finally {
      setLoading(false);
    }
  }, []);

  return children;
});

export default VideoWrapper;
