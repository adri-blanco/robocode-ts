import { Robot, RobotAI, ScannedRobotInfo } from "../types/RobotTypes.js";
export declare class MyFirstRobot implements RobotAI {
    robot: Robot;
    private target;
    private lastScanTime;
    private readonly scanInterval;
    private inMotion;
    constructor(robot: Robot);
    tick(deltaTime: number): Promise<void>;
    onScannedRobot(robot: ScannedRobotInfo): void;
    onHit(): void;
    onRobotCollision(robot: Robot): void;
}
//# sourceMappingURL=MyFirstRobot.d.ts.map