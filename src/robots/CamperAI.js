export class CamperAI {
    constructor(robot) {
        this.robot = robot;
        this.isInPosition = false;
        this.target = null;
        this.scanDirection = 1;
        this.repositioning = false;
    }
    async tick(deltaTime) {
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
        }
        else {
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
    calculateLeadAngle() {
        if (!this.target)
            return 0;
        // Simple leading algorithm based on target velocity and distance
        const timeToHit = this.target.distance / 400; // Assuming bullet speed of 400 pixels/sec
        const predictedMove = this.target.velocity * timeToHit;
        return Math.atan2(predictedMove, this.target.distance) * (180 / Math.PI);
    }
    async moveToCorner() {
        // Move to the nearest corner of the battlefield
        const angle = Math.random() * 360;
        await this.robot.turnRight(angle);
        await this.robot.ahead(200);
    }
    onScannedRobot(robot) {
        this.target = robot;
    }
    onRobotCollision(robot) {
        this.repositioning = true;
        this.isInPosition = false;
    }
}
//# sourceMappingURL=CamperAI.js.map