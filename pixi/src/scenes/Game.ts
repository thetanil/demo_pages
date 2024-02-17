import config from "../config";
import { Graphics, Text, TextStyle } from "pixi.js";
import ParallaxBackground from "../prefabs/ParallaxBackground";
import { Player } from "../prefabs/Player";
import Scene from "../core/Scene";
import SpineAnimation from "../core/SpineAnimation";

export default class Game extends Scene {
    name = "Game";

    private player!: Player;
    private background!: ParallaxBackground;

    load() {
        this.background = new ParallaxBackground(config.backgrounds.forest);
        this.player = new Player();

        this.player.x = window.innerWidth / 2;
        this.player.y = window.innerHeight - this.player.height / 3;

        this.addChild(this.background, this.player);

        let obj = new Graphics();
        obj.beginFill(0x000000);
        obj.drawRect(this.player.x, this.player.y, 100, 100);
        obj.endFill();
        this.addChild(obj);

        const basicText = new Text('Basic text in pixi');

        basicText.x = 50;
        basicText.y = 100;
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
        basicText.style = style;

        this.addChild(basicText);

        // this.background.initPlayerMovement(this.player);

    }

    async start() {
        // Example of how to play a spine animation
        const vine = new SpineAnimation("vine-pro");

        vine.stateData.setMix("grow", "grow", 0.5);

        vine.x = 0;
        vine.y = window.innerHeight / 2 - 50;

        // this.background.addChild(vine);

        // while (vine) {
        //   await vine.play("grow");
        // }
    }

    onResize(width: number, height: number) {
        if (this.player) {
            this.player.x = width / 2;
            this.player.y = height - this.player.height / 3;
        }

        if (this.background) {
            this.background.resize(width, height);
        }
    }
}
