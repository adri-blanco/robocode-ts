import { Robot, RobotAI, ScannedRobotInfo } from "../types/RobotTypes.js";

export class FocusRobot implements RobotAI {
  public robot: Robot;
  private target: ScannedRobotInfo | null;
  private lastScanTime: number;

  constructor(robot: Robot) {
    this.robot = robot;
    this.target = null;
    this.lastScanTime = 0;
  }

  async tick(deltaTime: number): Promise<void> {
    if (this.lastScanTime + 3000 < Date.now()) {
      this.target = null;
    }

    if (this.target) {
      await Promise.all([
        this.robot.aimTo(this.target.angle),
        this.robot.rotateTo(this.target.angle),
        this.robot.radarTo(this.target.angle),
      ]);
      if (this.target && this.target.distance > 100) {
        await this.robot.ahead(10);
      }
      await this.robot.fire(10);
    } else {
      await Promise.all([this.robot.turnRadarRight(10), this.robot.ahead(10)]);
    }
  }

  // Event handlers
  onScannedRobot(robot: ScannedRobotInfo): void {
    // Called when radar detects a robot
    if (!this.target || this.target.name === robot.name) {
      this.target = robot;
      this.lastScanTime = Date.now();
    }
  }

  onHit(): void {
    // Called when hit by a bullet
  }

  onRobotCollision(robot: Robot): void {
    // Called when colliding with another robot
  }

  onHitWall(wall: "top" | "right" | "bottom" | "left"): void {
    // Called when hitting a wall
    this.robot.turnRight(90);
  }
}
