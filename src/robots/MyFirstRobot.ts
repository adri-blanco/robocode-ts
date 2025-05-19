import { Robot, RobotAI, ScannedRobotInfo } from "../types/RobotTypes.js";

export class MyFirstRobot implements RobotAI {
  public robot: Robot;
  private target: ScannedRobotInfo | null;

  constructor(robot: Robot) {
    this.robot = robot;
    this.target = null;
  }

  async tick(deltaTime: number): Promise<void> {
    await this.robot.ahead(20);
    await this.robot.ahead(-20);
    await this.robot.turnRight(90);
    await this.robot.ahead(20);
    await this.robot.turnRight(-90);
    await this.robot.ahead(20);
    await this.robot.turnRight(90);
    await this.robot.turnLeft(90);
    await this.robot.ahead(20);
    await this.robot.turnRadarRight(90);
    await this.robot.ahead(20);
    await this.robot.turnRadarRight(-90);
    await this.robot.ahead(20);
    await this.robot.turnRadarLeft(90);
    await this.robot.ahead(20);
    await this.robot.turnRadarLeft(-90);
    await this.robot.ahead(20);
    await this.robot.fire(10);

    await this.robot.turnGunRight(90);
    await this.robot.ahead(20);
    await this.robot.turnGunRight(-90);
    await this.robot.ahead(-20);

    await this.robot.turnGunLeft(90);
    await this.robot.ahead(20);
    await this.robot.turnGunLeft(-90);
    await this.robot.ahead(-20);

    await this.robot.fire(10);
  }

  // Event handlers
  onScannedRobot(robot: ScannedRobotInfo): void {
    // Called when radar detects a robot
    // console.log(`Detected robot at distance: ${robot}`);
    this.target = robot;
  }

  onHit(): void {
    // Called when hit by a bullet
  }

  onRobotCollision(robot: Robot): void {
    // Called when colliding with another robot
  }

  onHitWall(wall: "top" | "right" | "bottom" | "left"): void {
    // Called when hitting a wall
    console.log("HIT ", wall);
  }
}
