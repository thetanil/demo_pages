import Scene from "../core/Scene";
import { Graphics, Color, Text, TextStyle, Container } from "pixi.js";

export default class Playground extends Scene {
    readonly cellsPerSide: number = 150;
    readonly boardSize: number = this.cellsPerSide * this.cellsPerSide;
    name = "Playground";
    fps = 0.0;
    fpsText: Text = new Text;
    dc = 0.0;

    // an implementation of conway's game of life in typescript using a single array
    // for the board state and a single array for the next state
    private board: boolean[] = new Array(this.boardSize);
    boardGfxCells: Graphics[] = new Array(this.boardSize);
    boardContainer: Container = new Container();
    cellSize = window.innerWidth / this.cellsPerSide;
    cellHeight = this.cellsPerSide;
    cellWidth = this.cellsPerSide;
    tick = 0;

    // onresize(width: number, height: number): void {

    initializeBoard() {
        console.log('initializeBoard')
        for (let i = 0; i < this.boardSize; i++) {
            this.board[i] = Math.random() > 0.5;
        }
        this.boardContainer.x = 0;
        this.boardContainer.y = 0;
        this.addChild(this.boardContainer);
        for (let i = 0; i < this.boardSize; i++) {
            this.boardGfxCells[i] = new Graphics();
        }

        let color = new Color('red');
        for (let i = 0; i < this.boardSize; i++) {
            this.boardGfxCells[i].beginFill(color);
            this.boardGfxCells[i].drawRect(
                (i % this.cellsPerSide) * this.cellSize,
                Math.floor(i / this.cellsPerSide) * this.cellSize,
                this.cellSize,
                this.cellSize
            );
            this.boardGfxCells[i].endFill();
        }
        this.boardContainer.addChild(...this.boardGfxCells);
    }

    // implementation of conway's game of life getNeighbors function using a single array
    private countNeighbors(x: number, y: number): number {
        let count = 0;

        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) continue;

                const newX = (x + i + this.cellHeight) % this.cellHeight;
                const newY = (y + j + this.cellWidth) % this.cellWidth;

                if (this.board[newX * this.cellWidth + newY]) {
                    count++;
                }
            }
        }

        return count;
    }

    calculateNextState(): void {
        const newBoard: boolean[] = new Array(this.cellWidth * this.cellHeight).fill(false);

        for (let i = 0; i < this.cellHeight; i++) {
            for (let j = 0; j < this.cellWidth; j++) {
                const neighbors = this.countNeighbors(i, j);

                if (this.board[i * this.cellWidth + j] && (neighbors === 2 || neighbors === 3)) {
                    newBoard[i * this.cellWidth + j] = true;
                } else if (!this.board[i * this.cellWidth + j] && neighbors === 3) {
                    newBoard[i * this.cellWidth + j] = true;
                }
            }
        }

        this.board = newBoard;
    }

    drawBoard() {
        for (let i = 0; i < this.boardSize; i++) {
            if (this.board[i]) {
                this.boardGfxCells[i].visible = true;
            } else {
                this.boardGfxCells[i].visible = false;
            }
        }
    }

    update(delta: number): void {
        // calculate FPS from delta
        this.fps = 1000 / delta;
        this.dc += delta;
        if (this.dc > 1000) {
            this.dc = 0;
        }
        this.calculateNextState();
        this.drawBoard();
        this.fpsText.text = `FPS: ${Math.floor(this.fps)}`;
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
        this.addChild(this.fpsText);
    }
}

