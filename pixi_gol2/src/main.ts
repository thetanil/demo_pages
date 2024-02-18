import SceneManager from "./core/SceneManager";
// import Text from "@pixi/text";
import { Debug } from "./utils/debug";

const sceneManager = new SceneManager();

// a loop to switch scenes after the await is done
// await promises in a sequence
// await sceneManager.switchScene("MainMenu");
await sceneManager.switchScene("Life01");

Debug.log("Main done");
// let scenes = [
//   sceneManager.switchScene("Life01"),
//   sceneManager.switchScene("Life02"),
// ];

// this function returns the list of scenes available in SceneManager
// console.log(sceneManager.sceneInstances);

// await sceneManager.switchScene("Playground");
// await sceneManager.switchScene("Game");
// Text button to go to gameplay screen
