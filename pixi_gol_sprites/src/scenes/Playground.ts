import Scene from "../core/Scene";
import { Sprite, Texture, Color, Text, TextStyle, Container } from "pixi.js";

export default class Playground extends Scene {
    name = "Playground";
    // readonly cellsPerSide: number = 150;
    private readonly cellSize: number = 5;
    private cellsHigh = Math.floor(window.innerHeight / this.cellSize)
    private cellsWide = Math.floor(window.innerWidth / this.cellSize)
    private boardSize: number = this.cellsHigh * this.cellsWide
    private cells: boolean[] = new Array(this.boardSize);
    private nextCells: boolean[] = new Array(this.boardSize);
    private gCells: Sprite[] = new Array(this.boardSize);

    private createPixelTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = this.cellSize;
        canvas.height = this.cellSize;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, this.cellSize, this.cellSize);
        }
        return Texture.from(canvas);
    }


    // an implementation of conway's game of life in typescript using a single array
    // for the board state and a single array for the next state
    private board: Container = new Container();
    tick = 0;
    fps = 0.0;
    fpsText: Text = new Text;
    dc = 0.0;

    // onresize(width: number, height: number): void {

    initializeBoard() {
        const pixelTexture = this.createPixelTexture();
        //const pixel = new Sprite(pixelTexture);

        console.log('initializeBoard')
        for (let i = 0; i < this.boardSize; i++) {
            if (i % 3 == 1) {
                this.cells[i] = 1;
            } else if (i % 7 == 1) {
                this.cells[i] = 1;
            } else if (i % 3 == 3) {
                this.cells[i] = 1;
            } else {
                this.cells[i] = 0;
            }
        }
        this.board.x = 0;
        this.board.y = 0;
        this.addChild(this.board);

        //let color = new Color('red');

        for (let x = 0; x < this.cellsWide; x++) {
            for(let y = 0; y < this.cellsHigh; y++) {
                this.gCells[y * this.cellsWide + x] = new Sprite(pixelTexture);
                this.gCells[y * this.cellsWide + x].tint = new Color({ h: x, s: y, v: 100, a: .5 })
                this.gCells[y * this.cellsWide + x].x = x * this.cellSize;
                this.gCells[y * this.cellsWide + x].y = y * this.cellSize;
            }
        }
        this.board.addChild(...this.gCells);
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
        for (let i = 0; i < this.cellsHigh; i++) {
            for (let j = 0; j < this.cellsWide; j++) {
                const neighbors = this.countNeighbors(i, j);

                if (this.cells[i * this.cellsWide + j] && (neighbors === 2 || neighbors === 3)) {
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
    }

    drawBoard() {
        for (let x = 0; x < this.cellsWide; x++) {
            for (let y = 0; y < this.cellsHigh; y++) {
                this.gCells[y * this.cellsWide + x].visible = this.cells[y * this.cellsWide + x];
            }
        }
    }

    update(delta: number): void {
        // calculate FPS from delta
        this.fps = 1000 / delta;
        this.dc += delta;
        if (this.dc > 1000) {
            this.fpsText.text = `FPS: ${Math.floor(this.fps)} `;
            this.dc = 0;
        }
        this.calculateNextState();
        this.drawBoard();
    }

    load() {
        this.initializeBoard();
        this.fpsText = new Text('FPS: 0');
        this.fpsText.x = 50;
        this.fpsText.y = 50;

        const style = new TextStyle({
            fontFamily: 'Arial',
            fontSize: 36,
            fontStyle: 'italic',
            fontWeight: 'bold',
            fill: ['#ffffff', '#00ff99'], // gradient
            stroke: '#4a1850',
            strokeThickness: 5,
            dropShadow: true,
            dropShadowColor: '#000000',
            dropShadowBlur: 4,
            dropShadowAngle: Math.PI / 6,
            dropShadowDistance: 6,
            wordWrap: true,
            wordWrapWidth: 440,
            lineJoin: 'round',
        });
        this.fpsText.style = style;
        // this.addChild(this.fpsText);
    }
}

