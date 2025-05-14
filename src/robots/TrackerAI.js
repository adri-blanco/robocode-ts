export class TrackerAI {
    constructor(robot) {
        this.robot = robot;
        this.circleSize = 150;
        this.direction = 1;
        this.target = null;
        this.lastScanTime = 0;
        this.avoidanceMode = false;
    }
    async tick(deltaTime) {
        // Continuously scan for targets
        if (Date.now() - this.lastScanTime > 500) {
            await this.robot.turnRadarRight(360);
            this.lastScanTime = Date.now();
        }
        if (this.avoidanceMode) {
            // Execute avoidance maneuver
            await this.robot.ahead(-50);
            await this.robot.turnRight(45);
            this.avoidanceMode = false;
            return;
        }
        if (this.target) {
            // Point gun at target
            this.robot.gunAngle = this.robot.angle + this.target.angle;
            // Move towards target while circling
            const targetAngle = this.target.angle;
            await this.robot.turnRight(targetAngle + 90 * this.direction);
            // Fire with high power when close and have enough energy
            const firePower = this.target.distance < 200 ? 3 : 1;
            if (this.robot.energy > firePower * 10 + 20) {
                this.robot.fire(firePower);
            }
            await this.robot.ahead(this.circleSize * this.direction);
            // Randomly change circle direction
            if (Math.random() < 0.2) {
                this.direction *= -1;
            }
        }
        else {
            // Search pattern when no target
            await this.robot.ahead(100);
            await this.robot.turnRight(60);
        }
    }
    onScannedRobot(robot) {
        // Update target information
        this.target = robot;
    }
    onRobotCollision(robot) {
        // Enable avoidance mode
        this.avoidanceMode = true;
        // Change direction
        this.direction *= -1;
    }
}
//# sourceMappingURL=TrackerAI.js.map