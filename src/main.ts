import { Game } from "./game/Game.js";
import { Robot } from "./game/Robot.js";
import { setupEditor, compileRobotScript } from "./editor/editor.js";
import { MyFirstRobot } from "./robots/MyFirstRobot.js";
import { HunterAI } from "./robots/HunterAI.js";
import { RobotAI } from "./types/RobotTypes.js";

// Function to generate random position within canvas bounds
function getRandomPosition(
  canvas: HTMLCanvasElement,
  robotRadius: number,
  existingRobots: Robot[]
) {
  const padding = robotRadius * 2; // Keep robots away from walls

  for (let attempts = 0; attempts < 100; attempts++) {
    const x = padding + Math.random() * (canvas.width - padding * 2);
    const y = padding + Math.random() * (canvas.height - padding * 2);

    // Check if this position collides with any existing robot
    let collides = false;
    for (const robot of existingRobots) {
      const dx = robot.x - x;
      const dy = robot.y - y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < robotRadius * 3) {
        // Use 3x radius for extra spacing
        collides = true;
        break;
      }
    }

    if (!collides) {
      return { x, y };
    }
  }

  // If we couldn't find a non-colliding position after many attempts,
  // return a position in one of the corners
  const corners = [
    { x: padding, y: padding },
    { x: canvas.width - padding, y: padding },
    { x: padding, y: canvas.height - padding },
    { x: canvas.width - padding, y: canvas.height - padding },
  ];
  return corners[Math.floor(Math.random() * corners.length)];
}

// Initialize the game when the window loads
window.addEventListener("load", () => {
  const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
  const game = new Game(canvas);

  // Add event listeners for game controls
  document.getElementById("startBattle")?.addEventListener("click", () => {
    game.start();
  });

  document.getElementById("pauseBattle")?.addEventListener("click", () => {
    game.togglePause();
  });

  document.getElementById("resetBattle")?.addEventListener("click", () => {
    game.reset();
  });

  // Create sample robots with different strategies
  const robotConfigs = [
    {
      name: "Hunter Bot",
      color: "#e056fd",
      ai: HunterAI,
    },
    // {
    //   name: "Spinner Bot",
    //   color: "#3498db",
    //   ai: SpinnerAI,
    // },
    // {
    //   name: "Walls Bot",
    //   color: "#e74c3c",
    //   ai: WallsAI,
    // },
    // {
    //   name: "Tracker Bot",
    //   color: "#2ecc71",
    //   ai: TrackerAI,
    // },
    // {
    //   name: "Random Bot",
    //   color: "#9b59b6",
    //   ai: RandomAI,
    // },
    {
      name: "Weich 2",
      color: "#845932",
      ai: MyFirstRobot,
    },
  ] as const;

  // Add robots to the game with random non-colliding positions
  const existingRobots: Robot[] = [];
  robotConfigs.forEach((config) => {
    const position = getRandomPosition(canvas, 20, existingRobots);
    const robot = new Robot(config.name, {
      name: config.name,
      x: position.x,
      y: position.y,
      angle: Math.random() * 360, // Random initial angle
      color: config.color,
    });

    // Create and attach AI
    robot.script = new config.ai(robot);
    game.addRobot(robot);
    existingRobots.push(robot);
  });

  // Update robot stats in the UI
  function updateRobotStats() {
    const robotList = document.getElementById("robotList");
    if (!robotList) return;

    robotList.innerHTML = "";

    game.robots.forEach((robot: Robot) => {
      const robotElement = document.createElement("div");
      robotElement.className = "robot-item";
      robotElement.innerHTML = `
                <div>${robot.name}</div>
                <div class="bars">
                    <div class="health" style="width: ${robot.health}%; background-color: ${robot.color}"></div>
                    <div class="energy" style="width: ${robot.energy}%"></div>
                </div>
            `;
      robotList.appendChild(robotElement);
    });
  }

  updateRobotStats();
  // Start the game loop
  game.onUpdate = updateRobotStats;
  game.initialize();
});
