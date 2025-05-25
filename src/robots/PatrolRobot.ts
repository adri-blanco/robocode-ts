import { Robot, RobotAI, ScannedRobotInfo } from "../types/RobotTypes.js";

export class PatrolRobot implements RobotAI {
  public robot: Robot;
  private target: ScannedRobotInfo | null = null;
  private readonly scanInterval = 100;
  private lastScanTime = 0;
  private patrolState = 0;
  private readonly patrolStates = 4;
  private readonly patrolDistance = 100;
  private homeX: number;
  private homeY: number;

  constructor(robot: Robot) {
    this.robot = robot;
    this.homeX = robot.x;
    this.homeY = robot.y;
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

      // Shoot if in range
      if (distance < 200) {
        await this.robot.fire(3);
      }

      // Move towards target if far from home
      const distanceFromHome = Math.sqrt(
        Math.pow(this.robot.x - this.homeX, 2) +
          Math.pow(this.robot.y - this.homeY, 2)
      );

      if (distanceFromHome < 300) {
        await this.robot.ahead(50);
      } else {
        // Return to patrol if too far from home
        this.target = null;
      }
    } else {
      // Patrol pattern
      switch (this.patrolState) {
        case 0: // Move right
          await this.robot.turnRight(0);
          await this.robot.ahead(this.patrolDistance);
          break;
        case 1: // Move down
          await this.robot.turnRight(90);
          await this.robot.ahead(this.patrolDistance);
          break;
        case 2: // Move left
          await this.robot.turnRight(180);
          await this.robot.ahead(this.patrolDistance);
          break;
        case 3: // Move up
        default:
          await this.robot.turnRight(270);
          await this.robot.ahead(this.patrolDistance);
          break;
      }

      // Update patrol state
      this.patrolState = (this.patrolState + 1) % this.patrolStates;

      // Scan while patrolling
      await this.robot.turnRadarRight(90);
    }
  }

  onScannedRobot(robot: ScannedRobotInfo): void {
    this.target = robot;
  }

  async onHit(): Promise<void> {
    // When hit, return to home position
    const angleToHome =
      (Math.atan2(this.homeY - this.robot.y, this.homeX - this.robot.x) * 180) /
      Math.PI;

    await this.robot.turnRight(angleToHome - this.robot.angle);
    await this.robot.ahead(100);
  }

  async onRobotCollision(robot: Robot): Promise<void> {
    // On collision, back up and continue patrol
    await this.robot.ahead(-50);
    this.target = null;
  }

  async onHitWall(wall: "top" | "right" | "bottom" | "left"): Promise<void> {
    // When hitting wall, continue patrol pattern
    this.patrolState = (this.patrolState + 1) % this.patrolStates;
    await this.robot.ahead(50);
  }
}
