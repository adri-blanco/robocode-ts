import { Robot, RobotAI, ScannedRobotInfo } from "../types/RobotTypes.js";

export class MyFirstRobot implements RobotAI {
  public robot: Robot;
  private target: ScannedRobotInfo | null;

  constructor(robot: Robot) {
    this.robot = robot;
    this.target = null;
  }

  async tick(deltaTime: number): Promise<void> {
    // await this.robot.ahead(20);
    // await this.robot.ahead(-20);
    // await this.robot.turnRight(90);
    // await this.robot.ahead(20);
    // await this.robot.turnRight(-90);
    // await this.robot.ahead(20);
    // await this.robot.turnLeft(90);
    // await this.robot.ahead(20);
    // await this.robot.turnRadarRight(90);
    // await this.robot.ahead(20);
    // await this.robot.turnRadarRight(-90);
    // await this.robot.ahead(20);
    await this.robot.turnRadarLeft(90);
    // await this.robot.ahead(20);
    // await this.robot.turnRadarLeft(-90);
    // await this.robot.ahead(20);
    // await this.robot.fire(10);
    // await this.robot.turnGunRight(90);
    // await this.robot.ahead(20);
    // await this.robot.turnGunRight(-90);
    // await this.robot.ahead(-20);
    // await this.robot.turnGunLeft(90);
    // await this.robot.ahead(20);
    // await this.robot.turnGunLeft(-90);
    // await this.robot.ahead(-20);
    // await this.robot.fire(10);

    await this.robot.fire(10);

    // console.log("Tick", this.target);
    // if (this.target !== null) {
    //   await this.robot.aimTo(this.target.angle);
    // }

    // if (this.target === null) {
    //   const promises = [this.robot.ahead(25), this.robot.turnRadarLeft(90)];

    //   await Promise.all(promises);
    // } else {
    //   console.log("TARGET", this.robot.angle, this.target.angle);

    //   await this.robot.turnRadarLeft(this.robot.angle - this.target.angle);
    //   this.target = null;
    // }
  }

  // Event handlers
  onScannedRobot(robot: ScannedRobotInfo): void {
    // Called when radar detects a robot
    this.target = robot;
    console.log("TARGET", this.target);
    this.robot.aimTo(this.target.angle);

    // Calculate absolute angle to target by adding the relative angle to current radar angle
    // const absoluteAngle = this.robot.radarAngle + robot.angle;

    // // Calculate the angle difference between gun and target
    // const gunAngleDiff = absoluteAngle - this.robot.gunAngle;

    // // Normalize the angle difference to be between -180 and 180 degrees
    // const normalizedDiff = ((gunAngleDiff + 180) % 360) - 180;

    // // Turn the gun towards the target
    // if (normalizedDiff > 0) {
    //   this.robot.turnGunRight(normalizedDiff);
    // } else {
    //   this.robot.turnGunLeft(normalizedDiff);
    // }

    // await this.robot.aimTo(robot.angle);

    // Fire if we're close to aiming at the target (within 5 degrees)
    // if (Math.abs(normalizedDiff) < 5) {
    //   this.robot.fire(100);
    // }
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
