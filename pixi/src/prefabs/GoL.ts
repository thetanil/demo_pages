import { Container } from "pixi.js";
import Keyboard from "../core/Keyboard";

export class GoL extends Container {
  private state = {
    velocity: { x: 0, y: 0 },
    acceleration: { x: 0, y: 0 },
    maxVelocity: { x: 0, y: 0 },
    drag: { x: 0, y: 0 },
    gravity: 0,
    jump: 0,
    dash: 0,
    dashSpeed: 0,
    dashDuration: 0,
    dashCooldown: 0,
  };
  private keyboard = Keyboard.getInstance();
  load() {
    this.keyboard.onAction(({ action, buttonState }) => {
      if (buttonState === "pressed") this.onActionPress(action);
      else if (buttonState === "released") this.onActionRelease(action);
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

  onActionRelease(action: keyof typeof Keyboard.actions) {
    if (
      (action === "LEFT" && this.state.velocity.x < 0) ||
      (action === "RIGHT" && this.state.velocity.x > 0)
    ) {
      console.log("action", action);
      //   this.stopMovement();
    }
  }
}
