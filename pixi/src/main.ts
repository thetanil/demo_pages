import SceneManager from "./core/SceneManager";

const sceneManager = new SceneManager();

await sceneManager.switchScene("Loading");
await sceneManager.switchScene("Playground");
// await sceneManager.switchScene("Game");
