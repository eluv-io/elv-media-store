import {flow, makeAutoObservable} from "mobx";
import {contentStore, rootStore} from "./index";
import UrlJoin from "url-join";
import URI from "urijs";
import Id from "@eluvio/elv-client-js/src/Id";

class ContentStore {
  loaded = false;
  loadingCurrentTitle = false;
  currentVideo = undefined;
  featuredVideo = undefined;
  titles = undefined;
  series = undefined;
  seasons = undefined;
  episodes = undefined;
  channels = undefined;
  playlists = undefined;
  trailers = undefined;
  seasonEpisodes = undefined;

  constructor(rootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

  get client() {
    return this.rootStore.client;
  }

  ImageLinks = async ({baseLinkUrl, images, versionHash}) => {
    if(!images) { return {}; }

    let landscapeUrl, portraitUrl, imageUrl;
    if(images.landscape && images.landscape.default) {
      landscapeUrl = this.CreateLink(baseLinkUrl, UrlJoin("images", "landscape", "default"));
    } else if(images.main_slider_background_desktop && images.main_slider_background_desktop.default) {
      landscapeUrl = this.CreateLink(baseLinkUrl, UrlJoin("images", "main_slider_background_desktop", "default"));
    }

    if(images.poster && images.poster.default) {
      portraitUrl = this.CreateLink(baseLinkUrl, UrlJoin("images", "poster", "default"));
    } else if(images.primary_portrait && images.primary_portrait.default) {
      portraitUrl = this.CreateLink(baseLinkUrl, UrlJoin("images", "primary_portrait", "default"));
    } else if(images.portrait && images.portrait.default) {
      portraitUrl = this.CreateLink(baseLinkUrl, UrlJoin("images", "portrait", "default"));
    }

    imageUrl = await this.client.ContentObjectImageUrl({versionHash});
    return {
      landscapeUrl,
      portraitUrl,
      imageUrl
    };
  }

  GenerateEmbedUrl = ({versionHash, objectId, token}) => {
    let embedUrl = new URL("https://embed.v3.contentfabric.io");
    const networkName = rootStore.networkInfo.name === "demov3" ? "demo" : (rootStore.networkInfo.name === "test" && rootStore.networkInfo.id === 955205) ? "testv4" : rootStore.networkInfo.name;

    embedUrl.searchParams.set("p", "");
    embedUrl.searchParams.set("lp", "");
    embedUrl.searchParams.set("net", networkName);
    embedUrl.searchParams.set("ct", "s");
    embedUrl.searchParams.set("nwm", "");

    if(this.rootStore.darkMode) {
      embedUrl.searchParams.set("dk", "");
    }

    if(token) {
      embedUrl.searchParams.set("ath", token);
    }

    if(versionHash) {
      embedUrl.searchParams.set("vid", versionHash);
    } else {
      embedUrl.searchParams.set("oid", objectId);
    }

    return embedUrl.toString();
  };

  CreateLink = (baseLink, path, query={}) => {
    if(!baseLink) { return ""; }

    const basePath = URI(baseLink).path();

    return URI(baseLink)
      .path(UrlJoin(basePath, path))
      .addQuery(query)
      .toString();
  };

  Reset = () => {
    this.loaded = false;
    this.loadingCurrentTitle = false;
    this.currentVideo = undefined;
    this.featuredVideo = undefined;
    this.titles = undefined;
    this.series = undefined;
    this.seasons = undefined;
    this.episodes = undefined;
    this.channels = undefined;
    this.playlists = undefined;
    this.trailers = undefined;
  }

  SetFeaturedVideo = flow(function * () {
    if(this.titles && this.titles.length) {
      const lastVideo = this.titles[this.titles.length - 1];
      lastVideo.embedPlayerUrl = yield this.GenerateEmbedUrl({
        versionHash: lastVideo.sources.default["."].container
      });
      this.featuredVideo = lastVideo;
    }
  });

  ContentObjectLibraryId = flow(function * ({objectId}) {
    return yield this.client.ContentObjectLibraryId({
      objectId
    });
  });

  LoadAssets = flow(function * ({objectId}) {
    try {
      const versionHash = yield this.client.LatestVersionHash({objectId});

      const {episodes, playlists, seasons, series, titles, trailers, channels, title_type} = yield this.client.ContentObjectMetadata({
        versionHash,
        metadataSubtree: "public/asset_metadata",
        resolveLinks: true,
        resolveIncludeSource: true,
        resolveIgnoreErrors: true,
        select: [
          "episodes",
          "playlists",
          "seasons",
          "series",
          "titles",
          "trailers",
          "channels",
          "title_type"
        ]
      });

      this.episodes = yield this.LoadTitles({titles: episodes, versionHash, metadataKey: "episodes"});
      this.seasons = yield this.LoadTitles({titles: seasons, versionHash, metadataKey: "seasons"});
      this.series = yield this.LoadTitles({titles: series, versionHash, metadataKey: "series"});
      this.titles = yield this.LoadTitles({titles, metadataKey: "titles", versionHash});
      this.trailers = yield this.LoadTitles({trailers, metadataKey: "trailers", versionHash});
      this.channels = yield this.LoadTitles({channels, metadataKey: "channels", versionHash});
      this.playlists = yield this.LoadPlaylists({versionHash, playlists});

      yield this.SetFeaturedVideo();

      if(title_type === "series" && this.seasons && this.seasons.length) {
        yield this.LoadSeasonEpisodes({objectId: this.seasons[0].objectId});
      }
    } catch(error) {
      // eslint-disable-next-line no-console
      console.error("Failed to load site:", objectId);
      // eslint-disable-next-line no-console
      console.error(error);
    } finally {
      this.loaded = true;
    }
  });

  LoadSeasonEpisodes = flow(function * ({objectId}) {
    this.seasonEpisodes = undefined;
    try {
      const versionHash = yield this.client.LatestVersionHash({objectId});

      const {episodes} = yield this.client.ContentObjectMetadata({
        versionHash,
        metadataSubtree: "public/asset_metadata",
        resolveLinks: true,
        resolveIncludeSource: true,
        resolveIgnoreErrors: true,
        select: [
          "episodes"
        ]
      });

      this.seasonEpisodes = yield this.LoadTitles({
        titles: episodes,
        versionHash,
        metadataKey: "episodes"
      });
    } catch(error) {
      // eslint-disable-next-line no-console
      console.error("Failed to load episodes for season:", objectId);
      // eslint-disable-next-line no-console
      console.error(error);
    }
  });

  LoadTitles = flow(function * ({metadataKey, titles, versionHash}) {
    if(!titles) { return []; }
    const titleObjects = [];

    yield Promise.all(
      Object.keys(titles).map(async (index) => {
        try {
          const titleKey = Object.keys(titles[index])[0];
          let title = titles[index][titleKey];

          title.versionHash = title["."].source;

          if(title["."].resolution_error) { return; }

          title.objectId = this.client.utils.DecodeVersionHash(title.versionHash).objectId;
          title.titleId = Id.next();

          const linkPath = UrlJoin("public", "asset_metadata", metadataKey, index, titleKey);
          title.playoutLinksPath = UrlJoin(linkPath, "sources");
          title.baseLinkPath = linkPath;
          title.baseLinkUrl = await this.client.LinkUrl({
            versionHash,
            linkPath
          });

          Object.assign(title,
            await this.ImageLinks({
              baseLinkUrl: title.baseLinkUrl,
              images: title.images,
              versionHash: title.versionHash
            })
          );

          titleObjects[index] = title;
        } catch(error) {
          // eslint-disable-next-line no-console
          console.error(`Failed to load title ${index}`);
          // eslint-disable-next-line no-console
          console.error(error);
        }
      })
    );

    return titleObjects.filter(title => title);
  });

  LoadPlaylists = flow(function * ({versionHash, playlists}) {
    if(!playlists || Object.keys(playlists).length === 0) { return []; }
    let playlistObjects = [];

    yield Promise.all(
      Object.keys(playlists).map(async (playlistSlug) => {
        try {
          const {name, order, list} = playlists[playlistSlug];
          let titles = [];

          await Promise.all(
            Object.keys(list || {}).map(async (titleSlug) => {
              try {
                let title = list[titleSlug];

                title.versionHash = title["."].source;

                if(title["."].resolution_error) { return; }
                title.objectId = this.client.utils.DecodeVersionHash(title.versionHash).objectId;

                const titleLinkPath = `public/asset_metadata/playlists/${playlistSlug}/list/${titleSlug}`;
                title.baseLinkPath = titleLinkPath;
                title.baseLinkUrl = await this.client.LinkUrl({
                  versionHash,
                  linkPath: titleLinkPath
                });

                title.playoutLinksPath = UrlJoin(titleLinkPath, "sources");
                title.titleId = Id.next();

                Object.assign(title,
                  await this.ImageLinks({
                    versionHash: title.versionHash,
                    images: title.images
                  })
                );

                titles[parseInt(title.order)] = title;
              } catch(error) {
                // eslint-disable-next-line no-console
                console.error(`Failed to load title ${titleSlug} in playlist ${order} (${name})`);
                // eslint-disable-next-line no-console
                console.error(error);
              }
            })
          );

          playlistObjects[parseInt(order)] = {
            playlistId: Id.next(),
            name,
            titles: titles.filter(title => title)
          };
        } catch(error) {
          // eslint-disable-next-line no-console
          console.error(`Failed to load playlist ${playlistSlug}`);
          // eslint-disable-next-line no-console
          console.error(error);
        }
      })
    );

    return playlistObjects.filter(playlist => playlist);
  });

  LoadTitle = flow(function *({objectId, libraryId}) {
    try {
      return yield this.client.ContentObjectMetadata({
        objectId,
        libraryId,
        metadataSubtree: "public",
        select: [
          "description",
          "asset_metadata"
        ]
      });
    } catch(error) {
      // eslint-disable-next-line no-console
      console.error(`Failed to load video: ${objectId}`);
      // eslint-disable-next-line no-console
      console.error(error);
    }
  });

  SetCurrentTitle = flow (function * ({objectId}) {
    this.currentVideo = undefined;
    this.loadingCurrentTitle = true;

    try {
      const {asset_metadata, description} = yield this.LoadTitle({
        objectId,
        libraryId: yield this.ContentObjectLibraryId({objectId}),
        metadataSubtree: "public",
        select: [
          "description",
          "asset_metadata"
        ]
      });
      const object = Object.assign(asset_metadata, {description});

      if(["series", "season"].includes(object.title_type)) {
        contentStore.LoadAssets({objectId});
      } else {
        object.embedPlayerUrl = yield this.GenerateEmbedUrl({
          versionHash: object.sources.default["."].container
        });

        this.currentVideo = object;
      }
      // this.loadingCurrentTitle = true;
    } catch(error) {
      // eslint-disable-next-line no-console
      console.error("Failed to set active title:");
      // eslint-disable-next-line no-console
      console.error(error);
    } finally {
      this.loadingCurrentTitle = false;
    }
  });
}

export default ContentStore;
