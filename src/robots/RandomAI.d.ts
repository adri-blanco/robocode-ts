import { Robot, RobotAI, ScannedRobotInfo } from "../types/RobotTypes";
export declare class RandomAI implements RobotAI {
    robot: Robot;
    private target;
    private nextMoveTime;
    private readonly moveInterval;
    constructor(robot: Robot);
    tick(deltaTime: number): Promise<void>;
    onScannedRobot(robot: ScannedRobotInfo): void;
    onRobotCollision(robot: Robot): void;
}
//# sourceMappingURL=RandomAI.d.ts.map