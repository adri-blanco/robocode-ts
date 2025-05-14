import { Robot, RobotAI, ScannedRobotInfo } from "../types/RobotTypes.js";
export declare class HunterAI implements RobotAI {
    robot: Robot;
    private target;
    private lastScanTime;
    private readonly scanInterval;
    constructor(robot: Robot);
    tick(deltaTime: number): Promise<void>;
    onScannedRobot(robot: ScannedRobotInfo): void;
    onHit(): void;
    onRobotCollision(robot: Robot): void;
}
//# sourceMappingURL=HunterAI.d.ts.map