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
    await contentStore.LoadAssets({
      objectId: match.params.objectId || rootStore.objectId
    });
  };

  useEffect(() => {
    setLoading(true);
    try {
      contentStore.Reset();
      LoadAssets();
    } finally {
      setLoading(false);
    }
  }, []);

  return children;
});

export default VideoWrapper;
