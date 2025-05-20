# Robocode TS

A JavaScript/Typescript implementation of the classic programming game Robocode. Program your robot tank to battle against other robots in a virtual arena!

## Features

- Modern web-based implementation
- Real-time battles
- Robot API similar to the original Robocode
- Health and energy systems
- Bullet physics and damage calculation
- Radar system for enemy detection
- Advanced collision detection and handling
- Energy management system

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:8085`

## Programming Your Robot

The game provides a simple API for programming your robot. Here's a basic example:

```javascript
class RobotAI {
  constructor(robot) {
    this.robot = robot;
  }

  async tick(deltaTime) {
    // Move forward 100 pixels
    await this.robot.ahead(100);

    // Turn right 90 degrees
    await this.robot.turnRight(90);

    // Fire with power 1
    this.robot.fire(1);
  }

  // Event handlers
  onScannedRobot(robot) {
    // Called when radar detects a robot
    console.log(`Detected robot at distance: ${robot.distance}`);
  }

  onHit() {
    // Called when hit by a bullet
  }

  onRobotCollision(robot) {
    // Called when colliding with another robot
  }

  onHitWall(wall: "top" | "right" | "bottom" | "left"): void {
    // Called when hitting a wall
    this.robot.turnRight(90);
  }
}
```

### Available Robot Methods

- `ahead(distance)`: Move forward (positive) or backward (negative)
- `turnRight(degrees)`: Turn right by specified degrees
- `turnLeft(degrees)`: Turn left by specified degrees
- `turnRadarRight(degrees)`: Turn radar right by specified degrees
- `turnRadarLeft(degrees)`: Turn radar left by specified degrees
- `fire(power)`: Fire a bullet with specified power (0.1 to 3.0)
- `aimTo(angle, offset = 0)`: Move the gun to an specific angle

### Robot Properties

- `health`: Current health (0-100)
- `energy`: Current energy (0-100)
- `x`, `y`: Current position
- `angle`: Current heading angle
- `gunAngle`: Current gun angle
- `radarAngle`: Current radar angle
- `velocity`: Current movement speed
- `turnRate`: Current turn rate
- `radarWidth`: Radar detection arc width (degrees)
- `radarRange`: Maximum radar detection range (pixels)

### Event Information

When a robot is scanned, the following information is provided:

- `name`: Name of the detected robot
- `distance`: Distance to the detected robot
- `angle`: Angle to the detected robot
- `energy`: Current energy of the detected robot
- `velocity`: Current velocity of the detected robot

## Sample Robots

The game comes with several sample robot AIs:

- **Hunter Bot**: Aggressively pursues and attacks with maximum firepower
- **Spinner Bot**: Stays in place, spins, and fires rapidly
- **Walls Bot**: Moves along walls and fires at detected enemies
- **Tracker Bot**: Circles around enemies while maintaining optimal distance
- **Random Bot**: Makes unpredictable moves and attacks

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Original Robocode by Mathew A. Nelson and Flemming N. Larsen
- Inspired by the classic Java version of Robocode
- Dev process improved by Cursor
