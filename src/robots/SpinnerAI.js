export class SpinnerAI {
    constructor(robot) {
        this.robot = robot;
        this.target = null;
        this.isRecovering = false;
    }
    async tick(deltaTime) {
        if (this.isRecovering) {
            // Move away from last collision
            const lastCollision = this.robot.getLastCollision();
            if (lastCollision) {
                const dx = this.robot.x - lastCollision.x;
                const dy = this.robot.y - lastCollision.y;
                const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
                await this.robot.turnRight(angle - this.robot.angle);
                await this.robot.ahead(100);
            }
            this.isRecovering = false;
        }
        // Constantly spin body and radar
        await this.robot.turnRadarRight(15);
        // Fire at detected robots
        if (this.target && this.robot.energy > 20) {
            this.robot.fire(0.5);
        }
    }
    onScannedRobot(robot) {
        this.target = robot;
        // Adjust gun angle to point at target
        this.robot.gunAngle = this.robot.angle + robot.angle;
    }
    onRobotCollision(robot) {
        this.isRecovering = true;
    }
}
//# sourceMappingURL=SpinnerAI.js.map