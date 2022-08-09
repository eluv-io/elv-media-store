import React from "react";
import {HashRouter, Redirect, Route, Switch} from "react-router-dom";
import {observer, Provider} from "mobx-react";
import {render} from "react-dom";

import "Assets/stylesheets/app.scss";
import * as Stores from "./stores";
import {rootStore} from "./stores";

import VideoLibrary from "Components/VideoLibrary";
import VideoDetails from "Components/VideoDetails";
import VideoWrapper from "Components/VideoWrapper";
import {PageLoader} from "Components/common/Loader";

export const appRoutes = [
  {path: "/videos", Component: VideoLibrary},
  {path: "/videos/:mediaId", Component: VideoDetails}
];

const App = observer(() => {
  if(!rootStore.loaded) { return <PageLoader />; }

  return (
    <div className="app-container">
      <Switch>
        <Redirect exact from="/" to="/videos" />
        {
          appRoutes.map(({path, Component}) => (
            <Route exact={true} key={path} path={path}>
              <div className="content">
                <VideoWrapper>
                  <Component />
                </VideoWrapper>
              </div>
            </Route>
          ))
        }
      </Switch>
    </div>
  );
});

render(
  <Provider {...Stores}>
    <React.StrictMode>
      <HashRouter>
        <App />
      </HashRouter>
    </React.StrictMode>
  </Provider>,
  document.getElementById("app")
);
