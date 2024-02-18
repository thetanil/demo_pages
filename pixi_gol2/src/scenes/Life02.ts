import { Color, Ticker, Graphics, Text, TextStyle } from "pixi.js";
import Scene from "../core/Scene";

export default class Life02 extends Scene {
  name = "Life02";
  private readonly cellSize: number = 5;
  private cellsHigh = Math.floor(window.innerHeight / this.cellSize);
  private cellsWide = Math.floor(window.innerWidth / this.cellSize);
  private boardSize: number = this.cellsHigh * this.cellsWide;
  private cells: boolean[] = new Array(this.boardSize);
  private nextCells: boolean[] = new Array(this.boardSize);
  private gCells: Graphics[] = new Array(this.boardSize);
  private fpsText: Text = new Text();
  private dc = 0.0; // delta accumulator
  private stateCalcMS = 0.0;
  private gfxDrawMS = 0.0;
  async load() {
    this.initDataBoard();
    this.initGfxBoard();
    this.showFps();
    Ticker.shared.add(this.update, this);
    // @ts-expect-error because hacks happen
    window.__PIXI_APP__.renderer.view.addEventListener(
      "pointerdown",
      () => {
        // @ts-expect-error because hacks happen
        window.sceneManager.switchScene("Life01");
      },
      { once: true }
    );
  }

  async start() {
    console.log("Life02 start");
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
      perfStr += `\nFrameTimeMS: ${Ticker.shared.deltaMS.toFixed(0)} `;
      perfStr += `\nStateCalc_us: ${this.stateCalcMS.toFixed(0)} `;
      perfStr += `\nGfxDraw_us: ${this.gfxDrawMS.toFixed(0)}`;
      this.fpsText.text = perfStr;
      this.dc = 0;
    }
  }

  showFps() {
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
}
