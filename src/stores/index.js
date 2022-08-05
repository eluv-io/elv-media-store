import {configure, flow, makeAutoObservable} from "mobx";
import {ElvWalletClient} from "@eluvio/elv-client-js/src/walletClient";
import {ElvClient} from "@eluvio/elv-client-js";
import ContentStore from "./Content";

// Force strict mode so mutations are only allowed within actions.
configure({
  enforceActions: "always"
});

const searchParams = new URLSearchParams(decodeURIComponent(window.location.search));

class RootStore {
  client = undefined;
  walletClient = undefined;
  networkInfo = undefined;
  loaded = false;
  loggedIn = false;
  language = "en";
  territory = "U.S.A";
  objectId = EluvioConfiguration["objectId"];
  darkMode = searchParams.has("dk") || this.GetSessionStorage("dark-mode");

  constructor() {
    makeAutoObservable(this);

    this.ToggleDarkMode(this.darkMode);
    this.Initialize();
    this.contentStore = new ContentStore(this);
  }

  Initialize = flow(function * () {
    try {
      this.client = yield ElvClient.FromConfigurationUrl({
        configUrl: EluvioConfiguration["config-url"],
        assumeV3: true
      });

      this.walletClient = yield ElvWalletClient.Initialize({
        network: EluvioConfiguration.network,
        mode: EluvioConfiguration.mode
      });

      let wallet = this.client.GenerateWallet();
      let signer = wallet.AddAccount({
        privateKey: EluvioConfiguration.key
      });

      this.client.SetSigner({signer});
      this.networkInfo = yield this.client.NetworkInfo();
      this.walletClient.LogOut();
    } catch(error) {
      console.error(error);
    } finally {
      this.loaded = true;
    }
  });

  Authenticate = flow(function * () {
    try {
      this.loggedIn = false;
      yield this.walletClient.LogIn({
        method: "popup",
        // clearLogin: true
      });

      this.loggedIn = true;
    } catch(error) {
      console.error(error);
    }
  });

  GetSessionStorage(key) {
    try {
      return sessionStorage.getItem(key);
    } catch(error) {
      return undefined;
    }
  }

  SetSessionStorage(key, value) {
    try {
      return sessionStorage.setItem(key, value);
    } catch(error) {
      return undefined;
    }
  }

  RemoveSessionStorage(key) {
    try {
      return sessionStorage.removeItem(key);
    } catch(error) {
      return undefined;
    }
  }

  ToggleDarkMode = (enabled) => {
    const themeContainer = document.querySelector("#_theme");
    if(!enabled) {
      this.RemoveSessionStorage("dark-mode");
      themeContainer.innerHTML = "";
      themeContainer.dataset.theme = "default";
      return;
    } else if(themeContainer.dataset.theme !== "dark") {
      this.SetSessionStorage("dark-mode", "true");
      import("Assets/stylesheets/themes/dark.theme.css")
        .then(theme => {
          themeContainer.innerHTML = theme.default;
        });

      themeContainer.dataset.theme = "dark";
    }

    this.darkMode = enabled;
  }
}

export const rootStore = new RootStore();
export const contentStore = rootStore.contentStore;

window.rootStore = rootStore;
