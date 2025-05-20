import { Robot, RobotAI, ScannedRobotInfo } from "../types/RobotTypes.js";

export class SniperV2Robot implements RobotAI {
  public robot: Robot;
  private target: ScannedRobotInfo | null = null;
  private readonly optimalDistance = 350; // Increased optimal distance
  private readonly scanInterval = 50; // Faster scanning
  private lastScanTime = 0;
  private lastTargetX: number = 0;
  private lastTargetY: number = 0;
  private lastTargetTime: number = 0;
  private readonly maxPower = 3;
  private readonly minPower = 1;

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
      const distance = this.target.distance;
      const angle = this.target.angle;
      const targetVelocity = this.target.velocity;

      // Calculate predicted position
      const timeToTarget = distance / 20; // Approximate bullet speed
      const predictedAngle = this.calculatePredictedAngle(
        angle,
        targetVelocity,
        timeToTarget
      );

      // Turn towards predicted position
      await this.robot.turnRight(predictedAngle);

      // Adjust distance with more precise control
      if (distance < this.optimalDistance - 30) {
        // Too close, move back
        await this.robot.ahead(-30);
      } else if (distance > this.optimalDistance + 30) {
        // Too far, move closer
        await this.robot.ahead(30);
      }

      // Calculate optimal fire power based on distance
      const power = this.calculateOptimalPower(distance);

      // Shoot if we're at a good distance and angle
      if (
        Math.abs(distance - this.optimalDistance) < 40 &&
        Math.abs(predictedAngle) < 5
      ) {
        this.robot.fire(power);
      }

      // Store target position for next tick
      this.lastTargetX =
        this.robot.x + Math.cos((angle * Math.PI) / 180) * distance;
      this.lastTargetY =
        this.robot.y + Math.sin((angle * Math.PI) / 180) * distance;
      this.lastTargetTime = now;
    } else {
      // No target, scan around with wider angle
      await this.robot.turnRadarRight(60);
    }
  }

  private calculatePredictedAngle(
    currentAngle: number,
    targetVelocity: number,
    timeToTarget: number
  ): number {
    // Simple linear prediction
    const predictedOffset = (targetVelocity * timeToTarget) / 10;
    return currentAngle + predictedOffset;
  }

  private calculateOptimalPower(distance: number): number {
    // Adjust power based on distance
    if (distance > 300) {
      return this.maxPower;
    } else if (distance < 200) {
      return this.minPower;
    } else {
      // Linear interpolation between min and max power
      return (
        this.minPower +
        ((distance - 200) / 100) * (this.maxPower - this.minPower)
      );
    }
  }

  onScannedRobot(robot: ScannedRobotInfo): void {
    this.target = robot;
  }

  async onHit(): Promise<void> {
    // When hit, move to a new position
    await this.robot.turnRight(45);
    await this.robot.ahead(-100);
    await this.robot.turnRight(-45);
  }

  async onRobotCollision(robot: Robot): Promise<void> {
    // Move away from collision and reset target
    await this.robot.turnRight(180);
    await this.robot.ahead(-100);
    this.target = null;
  }

  async onHitWall(wall: "top" | "right" | "bottom" | "left"): Promise<void> {
    // Find new position when hitting wall
    switch (wall) {
      case "top":
        await this.robot.turnRight(135);
        break;
      case "right":
        await this.robot.turnRight(135);
        break;
      case "bottom":
        await this.robot.turnRight(135);
        break;
      case "left":
        await this.robot.turnRight(135);
        break;
    }
    await this.robot.ahead(100);
  }
}
