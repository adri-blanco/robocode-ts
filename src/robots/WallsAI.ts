import { Robot, RobotAI, ScannedRobotInfo } from "../types/RobotTypes";

export class WallsAI implements RobotAI {
  public robot: Robot;
  private direction: number;
  private isMovingVertically: boolean;
  private target: ScannedRobotInfo | null;
  private collisionAvoidanceTime: number;

  constructor(robot: Robot) {
    this.robot = robot;
    this.direction = 1;
    this.isMovingVertically = false;
    this.target = null;
    this.collisionAvoidanceTime = 0;
  }

  async tick(deltaTime: number): Promise<void> {
    // Handle collision avoidance
    if (this.collisionAvoidanceTime > 0) {
      this.collisionAvoidanceTime -= deltaTime;
      return;
    }

    // Sweep radar back and forth
    await this.robot.turnRadarRight(45);
    await this.robot.turnRadarLeft(45);

    // Fire at detected robots with medium power
    if (this.target && this.robot.energy > 30) {
      this.robot.gunAngle = this.robot.angle + this.target.angle;
      this.robot.fire(1);
    }

    // Move in a rectangular pattern along the walls
    try {
      if (!this.isMovingVertically) {
        await this.robot.ahead(100 * this.direction);
        await this.robot.turnRight(90);
        this.isMovingVertically = true;
      } else {
        await this.robot.ahead(50);
        await this.robot.turnRight(90);
        this.direction *= -1;
        this.isMovingVertically = false;
      }
    } catch (e) {
      // If movement is interrupted (e.g., by wall hit), change direction
      this.direction *= -1;
    }
  }

  onScannedRobot(robot: ScannedRobotInfo): void {
    // Track the closest robot
    if (!this.target || robot.distance < this.target.distance) {
      this.target = robot;
    }
  }

  onRobotCollision(robot: Robot): void {
    // On collision, reverse direction and wait
    this.direction *= -1;
    this.collisionAvoidanceTime = 1000;
  }
}
