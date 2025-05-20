import { Robot, RobotAI, ScannedRobotInfo } from "../types/RobotTypes.js";

export class SpinnerRobot implements RobotAI {
  public robot: Robot;
  private target: ScannedRobotInfo | null = null;
  private readonly scanInterval = 50; // Faster scanning
  private lastScanTime = 0;
  private spinDirection = 1;
  private readonly spinSpeed = 45; // Degrees per tick

  constructor(robot: Robot) {
    this.robot = robot;
  }

  async tick(deltaTime: number): Promise<void> {
    const now = Date.now();
    if (now - this.lastScanTime < this.scanInterval) {
      return;
    }
    this.lastScanTime = now;

    // Constant spinning
    await this.robot.turnRight(this.spinSpeed * this.spinDirection);

    if (this.target) {
      const distance = this.target.distance;

      // Fire if target is in range
      if (distance < 250) {
        this.robot.fire(2);
      }

      // Move towards target while spinning
      if (distance > 150) {
        await this.robot.ahead(30);
      } else {
        await this.robot.ahead(-30); // Back up if too close
      }
    } else {
      // No target, move forward while spinning
      await this.robot.ahead(20);
    }
  }

  onScannedRobot(robot: ScannedRobotInfo): void {
    this.target = robot;
  }

  async onHit(): Promise<void> {
    // Change spin direction when hit
    this.spinDirection *= -1;
    await this.robot.ahead(-50);
  }

  async onRobotCollision(robot: Robot): Promise<void> {
    // Change spin direction and back up
    this.spinDirection *= -1;
    await this.robot.ahead(-100);
  }

  async onHitWall(wall: "top" | "right" | "bottom" | "left"): Promise<void> {
    // Change spin direction and move away from wall
    this.spinDirection *= -1;
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
    await this.robot.ahead(100);
  }
}
