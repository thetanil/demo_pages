import { Text } from "pixi.js";
import Scene from "../core/Scene";
import { centerObjects } from "../utils/misc";
import { Debug } from "../utils/debug";

export default class MainMenu extends Scene {
  name = "MailMenu";
  isDone = false;

  async load() {
    // await this.utils.assetLoader.loadAssetsGroup("Loading");

    // const bg = Sprite.from("bgNight");

    const text = new Text("Loading...", {
      fontFamily: "Verdana",
      fontSize: 50,
      fill: "white",
    });

    text.resolution = 2;
    text.onclick = () => {
      this.isDone = true;
    };

    centerObjects(text);

    this.addChild(text);

    // Text button to go to gameplay screen
    const nextText = new Text("Next", {
      fontFamily: "Roboto Mono",
      fill: 0x000000,
      fontSize: 24,
    });
    nextText.x = 35;
    nextText.y = 320;
    // These options make the text clickable
    nextText.eventMode = "static";
    nextText.cursor = "pointer";
    // Go to the gameplay scene when clicked
    nextText.on("pointerup", () => {
      // @ts-expect-error because window
      window.sceneManager.switchScene("Life01");
    });
    this.addChild(nextText);
  }

  // a function which returns a promise which resolves when isDone is true
  async waitTillDone() {
    return new Promise<void>((resolve) => {
      const interval = setInterval(() => {
        if (this.isDone) {
          clearInterval(interval);
          resolve();
        }
      }, 100);
    });
  }

  async start() {
    await this.waitTillDone();
    // await this.utils.assetLoader.loadAssetsGroup("Playground");
    Debug.log("MainMenu started");
  }
}
