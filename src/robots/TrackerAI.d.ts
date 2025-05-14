import { Robot, RobotAI, ScannedRobotInfo } from "../types/RobotTypes";
export declare class TrackerAI implements RobotAI {
    robot: Robot;
    private circleSize;
    private direction;
    private target;
    private lastScanTime;
    private avoidanceMode;
    constructor(robot: Robot);
    tick(deltaTime: number): Promise<void>;
    onScannedRobot(robot: ScannedRobotInfo): void;
    onRobotCollision(robot: Robot): void;
}
//# sourceMappingURL=TrackerAI.d.ts.map