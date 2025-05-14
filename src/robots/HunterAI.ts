import { Robot, RobotAI, ScannedRobotInfo } from "../types/RobotTypes.js";

export class HunterAI implements RobotAI {
  public robot: Robot;
  private target: ScannedRobotInfo | null;
  private lastScanTime: number;
  private readonly scanInterval: number;

  constructor(robot: Robot) {
    console.log("🚀 ~ HunterAI ~ constructor ~ robot:", robot);
    this.robot = robot;
    this.target = null;
    this.lastScanTime = 0;
    this.scanInterval = 100; // Scan more frequently
  }

  async tick(deltaTime: number): Promise<void> {
    // Continuously scan for targets
    if (Date.now() - this.lastScanTime > this.scanInterval) {
      await this.robot.turnRadarRight(360);
      this.lastScanTime = Date.now();
    }

    if (this.target) {
      // Calculate angle to target
      const angleToTarget = this.target.angle;

      // Turn to face the target
      await this.robot.turnRight(angleToTarget);

      // Point gun at target
      this.robot.gunAngle = this.robot.angle;

      // Calculate power based on available energy
      // Reserve 20% energy for movement
      const availableEnergy = Math.max(0, this.robot.energy - 20);
      const firePower = Math.min(3, availableEnergy / 10);

      // Fire with maximum possible power if we have enough energy
      if (firePower > 0.1) {
        this.robot.fire(firePower);
      }

      // Move towards target while maintaining optimal distance
      const optimalDistance = 200;
      if (this.target.distance > optimalDistance + 50) {
        // Move closer if too far
        await this.robot.ahead(50);
      } else if (this.target.distance < optimalDistance - 50) {
        // Back up if too close
        await this.robot.ahead(-50);
      } else {
        // Strafe at optimal distance
        await this.robot.turnRight(20);
        await this.robot.ahead(30);
      }
    } else {
      // Search pattern when no target
      await this.robot.turnRight(45);
      await this.robot.ahead(50);
    }
  }

  onScannedRobot(robot: ScannedRobotInfo): void {
    // Update target information, prioritize closer robots
    if (!this.target || robot.distance < this.target.distance) {
      this.target = robot;
    }
  }

  onHit(): void {
    // When hit, slightly adjust position to avoid being a stationary target
    this.robot.ahead(Math.random() > 0.5 ? 30 : -30);
  }

  onRobotCollision(robot: Robot): void {
    // Back up and turn when colliding with another robot
    this.robot.ahead(-50);
    this.robot.turnRight(90);
  }
}
