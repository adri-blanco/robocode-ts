import { Robot, RobotAI, ScannedRobotInfo } from "../types/RobotTypes";
export declare class WallsAI implements RobotAI {
    robot: Robot;
    private direction;
    private isMovingVertically;
    private target;
    private collisionAvoidanceTime;
    constructor(robot: Robot);
    tick(deltaTime: number): Promise<void>;
    onScannedRobot(robot: ScannedRobotInfo): void;
    onRobotCollision(robot: Robot): void;
}
//# sourceMappingURL=WallsAI.d.ts.map