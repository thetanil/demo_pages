import Scene from "../core/Scene";
import { GoL2 } from "../prefabs/GoL2";

export default class Playground extends Scene {
  name = "Playground";

  private GoL!: GoL2;

  load() {
    console.log("Playground load");
    this.GoL = new GoL2();
    this.addChild(this.GoL);
  }

  start() {
    console.log("Playground start");
  }
  // readonly cellsPerSide: number = 150;

  // an implementation of conway's game of life in typescript using a single array
  // for the board state and a single array for the next state

  // onresize(width: number, height: number): void {
}
