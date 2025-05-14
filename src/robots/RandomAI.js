export class RandomAI {
    constructor(robot) {
        this.robot = robot;
        this.target = null;
        this.nextMoveTime = 0;
        this.moveInterval = 1000; // Change movement every second
    }
    async tick(deltaTime) {
        // Scan for targets
        await this.robot.turnRadarRight(45);
        this.robot.health = 3000;
        // Random movement pattern
        if (Date.now() > this.nextMoveTime) {
            // Choose a random action
            const action = Math.floor(Math.random() * 4);
            switch (action) {
                case 0:
                    // Move forward
                    await this.robot.ahead(Math.random() * 100 + 50);
                    break;
                case 1:
                    // Move backward
                    await this.robot.ahead(-(Math.random() * 100 + 50));
                    break;
                case 2:
                    // Turn right
                    await this.robot.turnRight(Math.random() * 90 + 45);
                    break;
                case 3:
                    // Turn left
                    await this.robot.turnRight(-(Math.random() * 90 + 45));
                    break;
            }
            // Schedule next movement
            this.nextMoveTime = Date.now() + this.moveInterval;
        }
        // Fire at target if detected
        if (this.target && this.robot.energy > 15) {
            // Adjust gun angle with some randomness
            const randomSpread = (Math.random() - 0.5) * 10;
            this.robot.gunAngle = this.robot.angle + this.target.angle + randomSpread;
            // Random fire power between 0.1 and 1
            const firePower = Math.random() * 0.9 + 0.1;
            this.robot.fire(firePower);
        }
    }
    onScannedRobot(robot) {
        this.target = robot;
    }
    onRobotCollision(robot) {
        // Move away in a random direction
        this.robot.ahead(-(Math.random() * 100 + 50));
        this.robot.turnRight(Math.random() * 180);
    }
}
//# sourceMappingURL=RandomAI.js.map