export class MyFirstRobot {
    constructor(robot) {
        this.inMotion = false;
        this.robot = robot;
        this.target = null;
        this.lastScanTime = 0;
        this.scanInterval = 100; // Scan more frequently
    }
    async tick(deltaTime) {
        if (this.inMotion) {
            return;
        }
        this.inMotion = true;
        // Move forward 100 pixels
        if (Date.now() - this.lastScanTime > this.scanInterval) {
            console.log("Turn rada right");
            this.lastScanTime = Date.now();
            // console.log("ahead");
            await this.robot.ahead(10);
            await this.robot.ahead(-5);
        }
        // Turn right 90 degrees
        // await this.robot.turnRight(90);
        // await this.robot.ahead(1);
        // Fire with power 1
        // this.robot.maxEnergy = 300000;
        // await this.robot.fire(11);
        this.inMotion = false;
    }
    // Event handlers
    onScannedRobot(robot) {
        // Called when radar detects a robot
        console.log(`Detected robot at distance: ${robot}`);
    }
    onHit() {
        // Called when hit by a bullet
    }
    onRobotCollision(robot) {
        // Called when colliding with another robot
    }
}
//# sourceMappingURL=MyFirstRobot.js.map