import { Robot, RobotAI, ScannedRobotInfo } from "../types/RobotTypes.js";

export class SniperRobot implements RobotAI {
  public robot: Robot;
  private target: ScannedRobotInfo | null = null;
  private readonly optimalDistance = 300; // Optimal shooting distance
  private readonly scanInterval = 100;
  private lastScanTime = 0;

  constructor(robot: Robot) {
    this.robot = robot;
  }

  async tick(deltaTime: number): Promise<void> {
    const now = Date.now();
    if (now - this.lastScanTime < this.scanInterval) {
      return;
    }
    this.lastScanTime = now;

    // If we have a target, adjust position and shoot
    if (this.target) {
      const distance = this.target.distance;
      const angle = this.target.angle;

      // Turn towards target
      await this.robot.turnRight(angle);

      // Adjust distance
      if (distance < this.optimalDistance - 50) {
        // Too close, move back
        await this.robot.ahead(-50);
      } else if (distance > this.optimalDistance + 50) {
        // Too far, move closer
        await this.robot.ahead(50);
      }

      // Shoot if we're at a good distance
      if (Math.abs(distance - this.optimalDistance) < 50) {
        this.robot.fire(3); // High power shots
      }
    } else {
      // No target, scan around
      await this.robot.turnRadarRight(45);
    }
  }

  onScannedRobot(robot: ScannedRobotInfo): void {
    this.target = robot;
  }

  async onHit(): Promise<void> {
    // When hit, try to escape
    await this.robot.ahead(-100);
  }

  async onRobotCollision(robot: Robot): Promise<void> {
    // Move away from collision
    await this.robot.ahead(-50);
  }

  async onHitWall(wall: "top" | "right" | "bottom" | "left"): Promise<void> {
    // Turn away from wall
    switch (wall) {
      case "top":
        await this.robot.turnRight(90);
        break;
      case "right":
        await this.robot.turnRight(90);
        break;
      case "bottom":
        await this.robot.turnRight(90);
        break;
      case "left":
        await this.robot.turnRight(90);
        break;
    }
    await this.robot.ahead(50);
  }
}
