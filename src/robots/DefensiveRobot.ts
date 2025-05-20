import { Robot, RobotAI, ScannedRobotInfo } from "../types/RobotTypes.js";

export class DefensiveRobot implements RobotAI {
  public robot: Robot;
  private target: ScannedRobotInfo | null = null;
  private readonly scanInterval = 100;
  private lastScanTime = 0;
  private lastDirection = 1;
  private readonly dodgeDistance = 50;

  constructor(robot: Robot) {
    this.robot = robot;
  }

  async tick(deltaTime: number): Promise<void> {
    const now = Date.now();
    if (now - this.lastScanTime < this.scanInterval) {
      return;
    }
    this.lastScanTime = now;

    if (this.target) {
      const angle = this.target.angle;
      const distance = this.target.distance;

      // Turn towards target
      await this.robot.turnRight(angle);

      // Move in a zigzag pattern
      this.lastDirection *= -1;
      await this.robot.turnRight(45 * this.lastDirection);
      await this.robot.ahead(this.dodgeDistance);

      // Shoot while moving
      if (distance < 200) {
        this.robot.fire(2); // Lower power shots to conserve energy
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
    // When hit, dodge away
    this.lastDirection *= -1;
    await this.robot.turnRight(90 * this.lastDirection);
    await this.robot.ahead(this.dodgeDistance * 2);
  }

  async onRobotCollision(robot: Robot): Promise<void> {
    // On collision, back up and change direction
    this.lastDirection *= -1;
    await this.robot.turnRight(90 * this.lastDirection);
    await this.robot.ahead(-this.dodgeDistance);
  }

  async onHitWall(wall: "top" | "right" | "bottom" | "left"): Promise<void> {
    // Change direction when hitting walls
    this.lastDirection *= -1;
    switch (wall) {
      case "top":
        await this.robot.turnRight(90 * this.lastDirection);
        break;
      case "right":
        await this.robot.turnRight(90 * this.lastDirection);
        break;
      case "bottom":
        await this.robot.turnRight(90 * this.lastDirection);
        break;
      case "left":
        await this.robot.turnRight(90 * this.lastDirection);
        break;
    }
    await this.robot.ahead(this.dodgeDistance);
  }
}
