import { Robot, RobotAI, ScannedRobotInfo } from "../types/RobotTypes";
export declare class SpinnerAI implements RobotAI {
    robot: Robot;
    private target;
    private isRecovering;
    constructor(robot: Robot);
    tick(deltaTime: number): Promise<void>;
    onScannedRobot(robot: ScannedRobotInfo): void;
    onRobotCollision(robot: Robot): void;
}
//# sourceMappingURL=SpinnerAI.d.ts.map