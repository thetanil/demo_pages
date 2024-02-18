import { Button } from "@pixi/ui";
import { Graphics } from "@pixi/graphics";
import { Container, Ticker } from "pixi.js";
import Scene from "../core/Scene";
import { GoL2 } from "../prefabs/GoL2";
import { GoL } from "../prefabs/GoL";
import { centerElement } from "../utils/helpers/resize";

type GoLPrefab = {
  name: string;
  t: Container;
};

export default class Playground extends Scene {
  name = "Playground";

  static prefab: Record<string, GoLPrefab> = {
    GoL: { name: "GoL", t: new GoL() },
    GoL2: { name: "GoL2", t: new GoL2() },
  };

  private currentPrefab: GoLPrefab = Playground.prefab.GoL2;
  private activePrefab: GoLPrefab = Playground.prefab.GoL2;

  private GoL!: Container;

  load() {
    console.log("Playground load");
    this.GoL = this.currentPrefab.t;
    this.addChild(this.GoL);

    const redButton = new Button(
      new Graphics().beginFill("darkred").drawRoundedRect(0, 0, 100, 50, 15)
    );

    const greenButton = new Button(
      new Graphics().beginFill("darkgreen").drawRoundedRect(0, 0, 100, 50, 15)
    );

    redButton.onPress.connect(() => {
      this.currentPrefab = Playground.prefab.GoL;
    });
    greenButton.onPress.connect(() => {
      this.currentPrefab = Playground.prefab.GoL2;
    });
    const redContainer = new Container();
    const greenContainer = new Container();
    redContainer.addChild(redButton.view);
    greenContainer.addChild(greenButton.view);
    const buttons = new Container();
    buttons.addChild(greenContainer);
    buttons.addChild(redContainer);
    centerElement(buttons);
    this.addChild(buttons).transform.position.y += 100;
    redContainer.transform.position.x += 100;
    greenContainer.transform.position.x -= 100;
    Ticker.shared.add(this.update, this);
  }

  update() {
    if (this.currentPrefab.t !== this.activePrefab.t) {
      console.log("change prefab");
      this.removeChild(this.activePrefab.t);
      this.activePrefab = this.currentPrefab;
      this.addChild(this.activePrefab.t);
    }
  }

  start() {
    console.log("Playground start");
  }
  // readonly cellsPerSide: number = 150;

  // an implementation of conway's game of life in typescript using a single array
  // for the board state and a single array for the next state

  // onresize(width: number, height: number): void {
}
