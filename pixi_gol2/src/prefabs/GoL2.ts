import Keyboard from "../core/Keyboard";
import { Container, TextStyle, Graphics, Color, Text, Ticker } from "pixi.js";
// import { centerObjects } from "../utils/misc";

export class GoL2 extends Container {
  private readonly cellSize: number = 5;
  private readonly speed: number = 120;

  private cellsHigh = Math.floor(window.innerHeight / this.cellSize);
  private cellsWide = Math.floor(window.innerWidth / this.cellSize);
  private boardSize: number = this.cellsHigh * this.cellsWide;
  private cells: boolean[] = new Array(this.boardSize);
  private nextCells: boolean[] = new Array(this.boardSize);
  private gCells: Graphics[] = new Array(this.boardSize);

  // private board: Container = new Container();
  private fpsText: Text = new Text();
  private dc = 0.0; // delta accumulator
  // tick = 0;
  // fps = 0.0;
  // dc = 0.0;
  private stateCalcMS = 0.0;
  private gfxDrawMS = 0.0;
  private keyboard = Keyboard.getInstance();

  constructor() {
    console.log("GoL constructor");
    super();

    this.initDataBoard();
    this.initGfxBoard();
    this.showFps();
    Ticker.shared.maxFPS = this.speed;
    Ticker.shared.add(this.update, this);
  }

  initGfxBoard() {
    console.log("initGfxBoard");
    const color = new Color("red");
    for (let i = 0; i < this.boardSize; i++) {
      this.gCells[i] = new Graphics();
      this.gCells[i].beginFill(color);
      this.gCells[i].drawRect(
        (i % this.cellsWide) * this.cellSize,
        Math.floor(i / this.cellsWide) * this.cellSize,
        this.cellSize,
        this.cellSize
      );
      this.gCells[i].endFill();
    }
    this.addChild(...this.gCells);
  }

  initDataBoard() {
    console.log("initDataBoard");
    for (let i = 0; i < this.boardSize; i++) {
      this.cells[i] = Math.random() > 0.5;
    }
  }

  private countNeighbors(x: number, y: number): number {
    let count = 0;

    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        if (i === 0 && j === 0) continue;

        const newX = (x + i + this.cellsHigh) % this.cellsHigh;
        const newY = (y + j + this.cellsWide) % this.cellsWide;

        if (this.cells[newX * this.cellsWide + newY]) {
          count++;
        }
      }
    }

    return count;
  }

  calculateNextState(): void {
    const t = performance.now();
    for (let i = 0; i < this.cellsHigh; i++) {
      for (let j = 0; j < this.cellsWide; j++) {
        const neighbors = this.countNeighbors(i, j);

        if (
          this.cells[i * this.cellsWide + j] &&
          (neighbors === 2 || neighbors === 3)
        ) {
          this.nextCells[i * this.cellsWide + j] = true;
        } else if (!this.cells[i * this.cellsWide + j] && neighbors === 3) {
          this.nextCells[i * this.cellsWide + j] = true;
        }
      }
    }

    // this.cells = this.nextCells;
    for (let i = 0; i < this.boardSize; i++) {
      this.cells[i] = this.nextCells[i];
      this.nextCells[i] = false;
    }
    this.stateCalcMS = performance.now() - t;
  }

  drawBoard() {
    const t = performance.now();
    for (let i = 0; i < this.boardSize; i++) {
      if (this.cells[i]) {
        this.gCells[i].visible = true;
      } else {
        this.gCells[i].visible = false;
      }
    }
    this.gfxDrawMS = performance.now() - t;
  }

  update(): void {
    // console.log(`GoL update delta: ${delta}`);
    this.dc += Ticker.shared.deltaMS;
    this.calculateNextState();
    this.drawBoard();

    if (this.dc > 500) {
      let perfStr = `FPS: ${Ticker.shared.FPS.toFixed(0)} `;
      perfStr += `FrameTimeMS: ${Ticker.shared.deltaMS.toFixed(0)} `;
      perfStr += `StateCalc_us: ${this.stateCalcMS.toFixed(0)} `;
      perfStr += `GfxDraw_us: ${this.gfxDrawMS.toFixed(0)}`;
      this.fpsText.text = perfStr;
      this.dc = 0;
    }
  }

  showFps() {
    console.log("GoL showFps");

    const textStyle = new TextStyle({
      fontFamily: "Arial",
      fontSize: 36,
      fontStyle: "italic",
      fontWeight: "bold",
      fill: ["#ffffff", "#00ff99"], // gradient
      stroke: "#4a1850",
      strokeThickness: 5,
      dropShadow: true,
      dropShadowColor: "#000000",
      dropShadowBlur: 4,
      dropShadowAngle: Math.PI / 6,
      dropShadowDistance: 6,
      wordWrap: true,
      wordWrapWidth: 600,
      lineJoin: "round",
    });

    this.fpsText.x = 50;
    this.fpsText.y = 50;

    this.fpsText.style = textStyle;
    this.addChild(this.fpsText);
  }

  start() {
    console.log("GoL start");
  }

  load() {
    console.log("GoL load");
    this.initDataBoard();
    this.fpsText = new Text("FPS: 0");
    this.keyboard.onAction(({ action, buttonState }) => {
      if (buttonState === "pressed") this.onActionPress(action);
      // else if (buttonState === "released") this.onActionRelease(action);
    });
  }

  private onActionPress(action: keyof typeof Keyboard.actions) {
    switch (action) {
      case "LEFT":
        console.log("LEFT");
        // this.move(Directions.LEFT);
        break;
      case "RIGHT":
        console.log("RIGHT");
        // this.move(Directions.RIGHT);
        break;
      case "JUMP":
        console.log("JUMP");
        // this.jump();
        break;
      case "SHIFT":
        console.log("SHIFT");
        // this.dash();
        break;

      default:
        break;
    }
  }

  // onActionRelease(action: keyof typeof Keyboard.actions) {
  //   if (
  //     (action === "LEFT" && this.state.velocity.x < 0) ||
  //     (action === "RIGHT" && this.state.velocity.x > 0)
  //   ) {
  //     console.log("action", action);
  //     //   this.stopMovement();
  //   }
  // }
}
