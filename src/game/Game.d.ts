import { Robot } from "./Robot.js";
import { Bullet } from "./Bullet.js";
import { Game as GameType } from "../types/RobotTypes.js";
export declare class Game implements GameType {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    robots: Robot[];
    bullets: Bullet[];
    isRunning: boolean;
    isPaused: boolean;
    onUpdate: (() => void) | null;
    private lastTime;
    private readonly collisionDamage;
    private readonly minCollisionDamage;
    private readonly maxCollisionDamage;
    constructor(canvas: HTMLCanvasElement);
    private resizeCanvas;
    initialize(): void;
    start(): void;
    togglePause(): void;
    reset(): void;
    addRobot(robot: Robot): void;
    addBullet(bullet: Bullet): void;
    update(deltaTime: number): void;
    private handleRobotCollisions;
    private checkRobotCollision;
    private resolveRobotCollision;
    private createCollisionEffect;
    render(): void;
    private drawGrid;
    private gameLoop;
    private checkWallCollision;
    private checkBulletCollision;
}
//# sourceMappingURL=Game.d.ts.map