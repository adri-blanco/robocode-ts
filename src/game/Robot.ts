import { Bullet } from "./Bullet.js";
import {
  Game,
  RobotConfig,
  RobotAI,
  ScannedRobotInfo,
} from "../types/RobotTypes.js";

export class Robot {
  public name: string;
  private _x: number;
  private _y: number;
  private _angle: number;
  private _color: string;
  private _health: number;
  private _energy: number;
  private _velocity: number = 0;
  private _turnRate: number = 0;
  private _gunAngle: number;
  private _radarAngle: number;
  private _radarTurnRate: number = 0;
  public scannedRobots: ScannedRobotInfo[] = [];

  // Getters for private properties
  public get x(): number {
    return this._x;
  }
  public get y(): number {
    return this._y;
  }
  public get angle(): number {
    return this._angle;
  }
  public get color(): string {
    return this._color;
  }
  public get health(): number {
    return this._health;
  }
  public get energy(): number {
    return this._energy;
  }
  public get velocity(): number {
    return this._velocity;
  }
  public get turnRate(): number {
    return this._turnRate;
  }
  public get gunAngle(): number {
    return this._gunAngle;
  }
  public get radarAngle(): number {
    return this._radarAngle;
  }
  public get radarTurnRate(): number {
    return this._radarTurnRate;
  }

  // Constants
  public readonly radius: number = 20;
  public readonly maxHealth: number = 100;
  public readonly maxEnergy: number = 100;
  public readonly gunCooldown: number = 500; // milliseconds
  public readonly radarWidth: number = 45; // degrees
  public readonly radarRange: number = 400; // pixels

  // Collision tracking
  private prevX: number;
  private prevY: number;
  private collisionCooldown: number = 0;
  private lastCollision: Robot | null = null;
  private lastShot: number = 0;

  // Reference to game instance
  public game: Game | null = null;

  // AI script context
  public script: RobotAI | null = null;
  public inMotion: boolean = false;

  constructor(name: string, config: RobotConfig) {
    this.name = name;
    this._x = config.x;
    this._y = config.y;
    this._angle = config.angle;
    this._color = config.color;
    this._health = this.maxHealth;
    this._energy = this.maxEnergy;
    this._gunAngle = this._angle;
    this._radarAngle = this._angle;
    this.prevX = this._x;
    this.prevY = this._y;
  }

  public reset(): void {
    this._health = this.maxHealth;
    this._energy = this.maxEnergy;
    this._velocity = 0;
    this._turnRate = 0;
    this._gunAngle = this._angle;
    this._radarAngle = this._angle;
    this._radarTurnRate = 0;
    this.scannedRobots = [];
    this.collisionCooldown = 0;
    this.lastCollision = null;
  }

  public damage(amount: number): void {
    this._health = Math.max(0, this._health - amount);
    this.onHit();
  }

  public async update(deltaTime: number): Promise<void> {
    if (this._health <= 0) return;

    // Update collision cooldown
    if (this.collisionCooldown > 0) {
      this.collisionCooldown -= deltaTime;
    }

    // Update position based on velocity
    const radians = (this._angle * Math.PI) / 180;
    this._x += Math.cos(radians) * this._velocity * (deltaTime / 1000);
    this._y += Math.sin(radians) * this._velocity * (deltaTime / 1000);

    // Update angles
    this._angle += this._turnRate * (deltaTime / 1000);
    this._angle = this.normalizeAngle(this._angle);

    // Update radar angle
    this._radarAngle += this._radarTurnRate * (deltaTime / 1000);
    this._radarAngle = this.normalizeAngle(this._radarAngle);

    // Perform radar scan
    this.scan();

    // Regenerate energy
    this._energy = Math.min(
      this.maxEnergy,
      this._energy + (deltaTime / 1000) * 10
    );

    // Execute AI script if available
    if (this.script && !this.inMotion) {
      try {
        this.inMotion = true;
        await this.script.tick(deltaTime);
        this.inMotion = false;
      } catch (error) {
        console.error(`Error in robot ${this.name} script:`, error);
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D): void {
    if (this._health <= 0) return;

    ctx.save();

    // Draw tank body
    ctx.translate(this._x, this._y);
    ctx.rotate((this._angle * Math.PI) / 180);

    // Add collision effect if recently collided
    if (this.collisionCooldown > 0) {
      ctx.shadowColor = "rgba(255, 200, 0, 0.5)";
      ctx.shadowBlur = 10;
    }

    ctx.fillStyle = this._color;
    ctx.strokeStyle = "#2c3e50";
    ctx.lineWidth = 2;

    // Tank body
    ctx.fillRect(-this.radius, -this.radius, this.radius * 2, this.radius * 2);
    ctx.strokeRect(
      -this.radius,
      -this.radius,
      this.radius * 2,
      this.radius * 2
    );

    // Gun
    ctx.rotate(((this._gunAngle - this._angle) * Math.PI) / 180);
    ctx.fillStyle = "#34495e";
    ctx.fillRect(0, -4, this.radius * 1.5, 8);

    ctx.restore();

    // Draw radar cone
    this.renderRadar(ctx);

    // Draw health bar
    const healthBarWidth = this.radius * 2;
    const healthBarHeight = 4;
    const healthBarY = this._y - this.radius - 10;

    ctx.fillStyle = "#e74c3c";
    ctx.fillRect(
      this._x - healthBarWidth / 2,
      healthBarY,
      healthBarWidth,
      healthBarHeight
    );

    ctx.fillStyle = "#2ecc71";
    ctx.fillRect(
      this._x - healthBarWidth / 2,
      healthBarY,
      healthBarWidth * (this._health / this.maxHealth),
      healthBarHeight
    );
  }

  private renderRadar(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.translate(this._x, this._y);
    ctx.rotate((this._radarAngle * Math.PI) / 180);

    // Draw radar cone
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(
      0,
      0,
      this.radarRange,
      ((-this.radarWidth / 2) * Math.PI) / 180,
      ((this.radarWidth / 2) * Math.PI) / 180
    );
    ctx.closePath();

    // Fill with semi-transparent color
    ctx.fillStyle = `${this._color}33`;
    ctx.fill();

    // Draw radar outline
    ctx.strokeStyle = this._color;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();
  }

  // Robot API methods
  public async ahead(distance: number): Promise<void> {
    this._velocity = distance > 0 ? 100 : -100;
    let remainingDistance = distance;
    let lastTime = performance.now();
    return new Promise((resolve) => {
      const checkDistance = () => {
        const currentTime = performance.now();
        const deltaTime = currentTime - lastTime;
        lastTime = currentTime;

        const step = this._velocity * (deltaTime / 1000);
        remainingDistance -= step;

        // Check if we've overshot
        if (
          (distance > 0 && remainingDistance < 0) ||
          (distance < 0 && remainingDistance > 0)
        ) {
          this._velocity = 0;
          resolve();
          return;
        }
        requestAnimationFrame(checkDistance);
      };
      checkDistance();
    });
  }

  public async turnRight(degrees: number): Promise<void> {
    this._turnRate = 90; // 90 degrees per second
    return new Promise((resolve) => {
      const targetAngle = this.normalizeAngle(this._angle + degrees);
      const checkAngle = () => {
        if (Math.abs(this._angle - targetAngle) <= 1) {
          this._turnRate = 0;
          this._angle = targetAngle;
          resolve();
        } else {
          requestAnimationFrame(checkAngle);
        }
      };
      checkAngle();
    });
  }

  public async turnLeft(degrees: number): Promise<void> {
    return this.turnRight(-degrees);
  }

  public async turnRadarRight(degrees: number): Promise<void> {
    this._radarTurnRate = 180; // 180 degrees per second
    return new Promise((resolve) => {
      const targetAngle = this.normalizeAngle(this._radarAngle + degrees);
      const checkAngle = () => {
        if (Math.abs(this._radarAngle - targetAngle) <= 1) {
          this._radarTurnRate = 0;
          this._radarAngle = targetAngle;
          resolve();
        } else {
          requestAnimationFrame(checkAngle);
        }
      };
      checkAngle();
    });
  }

  public async turnRadarLeft(degrees: number): Promise<void> {
    return this.turnRadarRight(-degrees);
  }

  public fire(power: number): void {
    console.log("Firing", power);
    const now = Date.now();
    if (this._energy >= power * 10 && now - this.lastShot >= this.gunCooldown) {
      const bullet = new Bullet(this, power);
      if (this.game) {
        this.game.addBullet(bullet);
      }
      this._energy -= power * 10;
      this.lastShot = now;
    } else {
      console.log("Not enough energy to fire");
    }
  }

  public scan(): ScannedRobotInfo[] {
    this.scannedRobots = [];

    if (!this.game) return [];

    // Get all robots except self
    const otherRobots = this.game.robots.filter(
      (r) => r !== this && r.health > 0
    );

    otherRobots.forEach((robot) => {
      // Calculate angle to robot
      const dx = robot.x - this._x;
      const dy = robot.y - this._y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const angle = this.normalizeAngle(
        (Math.atan2(dy, dx) * 180) / Math.PI - this._radarAngle
      );

      // Check if robot is within radar range and arc
      if (
        distance <= this.radarRange &&
        Math.abs(angle) <= this.radarWidth / 2
      ) {
        const scannedInfo: ScannedRobotInfo = {
          name: robot.name,
          distance: distance,
          angle: angle,
          energy: robot.energy,
          velocity: robot.velocity,
        };
        this.scannedRobots.push(scannedInfo);

        // Trigger onScannedRobot event
        this.onScannedRobot(scannedInfo);
      }
    });

    return this.scannedRobots;
  }

  // Event handlers
  public onHit(): void {
    if (this.script?.onHit) {
      this.script.onHit();
    }
  }

  public onScannedRobot(robot: ScannedRobotInfo): void {
    if (this.script?.onScannedRobot) {
      this.script.onScannedRobot(robot);
    }
  }

  public onRobotCollision(robot: Robot): void {
    // Set collision cooldown for visual effect
    this.collisionCooldown = 500; // 500ms
    this.lastCollision = robot;

    if (this.script?.onRobotCollision) {
      this.script.onRobotCollision(robot);
    }
  }

  public onHitWall(wall: "top" | "right" | "bottom" | "left"): void {
    if (this.script?.onHitWall) {
      this.script.onHitWall(wall);
    }
  }

  public getLastCollision(): Robot | null {
    return this.lastCollision;
  }

  public storePreviousPosition(): void {
    this.prevX = this._x;
    this.prevY = this._y;
  }

  public resetToStoredPosition(): void {
    this._x = this.prevX;
    this._y = this.prevY;
  }

  private normalizeAngle(angle: number): number {
    angle = angle % 360;
    return angle < 0 ? angle + 360 : angle;
  }

  public setPosition(x: number, y: number): void {
    this._x = x;
    this._y = y;
  }

  public stop(): void {
    this._velocity = 0;
  }
}
