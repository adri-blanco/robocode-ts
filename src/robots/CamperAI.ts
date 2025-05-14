import { Robot, RobotAI, ScannedRobotInfo } from "../types/RobotTypes";

export class CamperAI implements RobotAI {
  public robot: Robot;
  private isInPosition: boolean;
  private target: ScannedRobotInfo | null;
  private scanDirection: number;
  private repositioning: boolean;

  constructor(robot: Robot) {
    this.robot = robot;
    this.isInPosition = false;
    this.target = null;
    this.scanDirection = 1;
    this.repositioning = false;
  }

  async tick(deltaTime: number): Promise<void> {
    if (this.repositioning) {
      // Move to a different corner when disturbed
      await this.moveToCorner();
      this.repositioning = false;
      return;
    }

    if (!this.isInPosition) {
      // Move to nearest corner
      await this.moveToCorner();
      this.isInPosition = true;
    } else {
      // Scan area by rotating radar back and forth
      await this.robot.turnRadarRight(45 * this.scanDirection);
      this.scanDirection *= -1;

      if (this.target) {
        // Adjust gun to lead the target based on distance and velocity
        const leadAngle = this.calculateLeadAngle();
        this.robot.gunAngle = this.robot.angle + this.target.angle + leadAngle;

        // Fire with high power when we have enough energy
        if (this.robot.energy > 30) {
          this.robot.fire(2);
        }
      }
    }
  }

  private calculateLeadAngle(): number {
    if (!this.target) return 0;

    // Simple leading algorithm based on target velocity and distance
    const timeToHit = this.target.distance / 400; // Assuming bullet speed of 400 pixels/sec
    const predictedMove = this.target.velocity * timeToHit;
    return Math.atan2(predictedMove, this.target.distance) * (180 / Math.PI);
  }

  private async moveToCorner(): Promise<void> {
    // Move to the nearest corner of the battlefield
    const angle = Math.random() * 360;
    await this.robot.turnRight(angle);
    await this.robot.ahead(200);
  }

  onScannedRobot(robot: ScannedRobotInfo): void {
    this.target = robot;
  }

  onRobotCollision(robot: Robot): void {
    this.repositioning = true;
    this.isInPosition = false;
  }
}
