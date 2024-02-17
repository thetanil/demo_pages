import Scene from "../core/Scene";
import { Text, TextStyle } from "pixi.js";

export default class Game extends Scene {
    name = "Playground";
    fps = 0;
    fpsText: Text = new Text;
    dc = 0.0;
    update(delta: number): void {
        // calculate FPS from delta
        this.fps = 1000 / delta;


        this.dc += delta;
        if (this.dc > 1000) {
            this.fpsText.text = `FPS: ${this.fps.toFixed(2)}`;
            this.dc = 0;
        }
    }
    load() {
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

