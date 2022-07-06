import {configure, flow, makeAutoObservable} from "mobx";
import {ElvWalletClient} from "@eluvio/elv-client-js/src/walletClient";
import {ElvClient} from "@eluvio/elv-client-js";
import ContentStore from "./Content";

// Force strict mode so mutations are only allowed within actions.
configure({
  enforceActions: "always"
});

class RootStore {
  client = undefined;
  walletClient = undefined;
  networkInfo = undefined;
  loaded = false;
  loggedIn = false;
  language = "en";
  territory = "U.S.A";
  objectId = EluvioConfiguration["objectId"];

  constructor() {
    makeAutoObservable(this);

    this.Initialize();
    this.contentStore = new ContentStore(this);
  }

  Initialize = flow(function * () {
    try {
      this.client = yield ElvClient.FromConfigurationUrl({
        configUrl: EluvioConfiguration["config-url"],
        assumeV3: true
      });

      this.walletClient = new ElvWalletClient({
        client: this.client,
        network: EluvioConfiguration["network"],
        mode: EluvioConfiguration["mode"]
      });

      let wallet = this.client.GenerateWallet();
      let signer = wallet.AddAccount({
        privateKey: EluvioConfiguration["key"]
      });

      this.client.SetSigner({signer});
      this.networkInfo = yield this.client.NetworkInfo();
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
        method: "popup"
      });

      this.loggedIn = true;
    } catch(error) {
      console.error(error);
    }
  });
}

export const rootStore = new RootStore();
export const contentStore = rootStore.contentStore;

window.rootStore = rootStore;
