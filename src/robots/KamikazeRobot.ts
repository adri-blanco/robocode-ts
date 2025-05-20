import { Robot, RobotAI, ScannedRobotInfo } from "../types/RobotTypes.js";

export class KamikazeRobot implements RobotAI {
  public robot: Robot;
  private target: ScannedRobotInfo | null = null;
  private readonly scanInterval = 100;
  private lastScanTime = 0;
  private isCharging = false;

  constructor(robot: Robot) {
    this.robot = robot;
  }

  async tick(deltaTime: number): Promise<void> {
    const now = Date.now();
    // if (now - this.lastScanTime < this.scanInterval) {
    //   return;
    // }
    this.lastScanTime = now;
    // console.log("Kamikaze:", this.target);
    if (this.target) {
      const angle = this.target.angle;
      const distance = this.target.distance;

      // Turn towards target
      await this.robot.turnRight(angle);

      // Charge at target
      if (!this.isCharging) {
        this.isCharging = true;
        await this.robot.ahead(200);
        this.isCharging = false;
      }

      // Fire at close range
      if (distance < 100) {
        this.robot.fire(50); // High power shots at close range
      }
    } else {
      // No target, scan around
      await this.robot.turnRadarRight(90);
    }
  }

  onScannedRobot(robot: ScannedRobotInfo): void {
    this.target = robot;
  }

  async onHit(): Promise<void> {
    // When hit, charge even harder!
    this.target = null; // Forget current target
    await this.robot.ahead(100);
  }

  async onRobotCollision(robot: Robot): Promise<void> {
    // On collision, fire and back up
    this.robot.fire(5);
    await this.robot.ahead(-50);
  }

  async onHitWall(wall: "top" | "right" | "bottom" | "left"): Promise<void> {
    // Bounce off walls
    switch (wall) {
      case "top":
        await this.robot.turnRight(180);
        break;
      case "right":
        await this.robot.turnRight(180);
        break;
      case "bottom":
        await this.robot.turnRight(180);
        break;
      case "left":
        await this.robot.turnRight(180);
        break;
    }
    await this.robot.ahead(100);
  }
}
