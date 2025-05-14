import { Robot } from "./Robot";
export declare class Bullet {
    readonly owner: Robot;
    readonly power: number;
    x: number;
    y: number;
    readonly velocity: number;
    readonly angle: number;
    readonly damage: number;
    readonly radius: number;
    constructor(owner: Robot, power: number);
    update(deltaTime: number): void;
    render(ctx: CanvasRenderingContext2D): void;
}
//# sourceMappingURL=Bullet.d.ts.map