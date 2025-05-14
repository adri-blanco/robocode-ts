import { Robot, RobotAI, ScannedRobotInfo } from "../types/RobotTypes";
export declare class CamperAI implements RobotAI {
    robot: Robot;
    private isInPosition;
    private target;
    private scanDirection;
    private repositioning;
    constructor(robot: Robot);
    tick(deltaTime: number): Promise<void>;
    private calculateLeadAngle;
    private moveToCorner;
    onScannedRobot(robot: ScannedRobotInfo): void;
    onRobotCollision(robot: Robot): void;
}
//# sourceMappingURL=CamperAI.d.ts.map