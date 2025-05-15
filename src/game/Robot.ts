import { Bullet } from "./Bullet.js";
import {
  Game,
  RobotConfig,
  RobotAI,
  ScannedRobotInfo,
} from "../types/RobotTypes.js";

export class Robot {
  public name: string;
  public x: number;
  public y: number;
  public angle: number;
  public color: string;
  public health: number;
  public energy: number;
  public velocity: number = 0;
  public turnRate: number = 0;
  public gunAngle: number;
  public radarAngle: number;
  public radarTurnRate: number = 0;
  public scannedRobots: ScannedRobotInfo[] = [];

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
    this.x = config.x;
    this.y = config.y;
    this.angle = config.angle;
    this.color = config.color;
    this.health = this.maxHealth;
    this.energy = this.maxEnergy;
    this.gunAngle = this.angle;
    this.radarAngle = this.angle;
    this.prevX = this.x;
    this.prevY = this.y;
  }

  public reset(): void {
    this.health = this.maxHealth;
    this.energy = this.maxEnergy;
    this.velocity = 0;
    this.turnRate = 0;
    this.gunAngle = this.angle;
    this.radarAngle = this.angle;
    this.radarTurnRate = 0;
    this.scannedRobots = [];
    this.collisionCooldown = 0;
    this.lastCollision = null;
  }

  public damage(amount: number): void {
    this.health = Math.max(0, this.health - amount);
    this.onHit();
  }

  public async update(deltaTime: number): Promise<void> {
    if (this.health <= 0) return;

    // Update collision cooldown
    if (this.collisionCooldown > 0) {
      this.collisionCooldown -= deltaTime;
    }

    // Update position based on velocity
    const radians = (this.angle * Math.PI) / 180;
    this.x += Math.cos(radians) * this.velocity * (deltaTime / 1000);
    this.y += Math.sin(radians) * this.velocity * (deltaTime / 1000);

    // Update angles
    this.angle += this.turnRate * (deltaTime / 1000);
    this.angle = this.normalizeAngle(this.angle);

    // Update radar angle
    this.radarAngle += this.radarTurnRate * (deltaTime / 1000);
    this.radarAngle = this.normalizeAngle(this.radarAngle);

    // Perform radar scan
    this.scan();

    // Regenerate energy
    this.energy = Math.min(
      this.maxEnergy,
      this.energy + (deltaTime / 1000) * 10
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
    if (this.health <= 0) return;

    ctx.save();

    // Draw tank body
    ctx.translate(this.x, this.y);
    ctx.rotate((this.angle * Math.PI) / 180);

    // Add collision effect if recently collided
    if (this.collisionCooldown > 0) {
      ctx.shadowColor = "rgba(255, 200, 0, 0.5)";
      ctx.shadowBlur = 10;
    }

    ctx.fillStyle = this.color;
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
    ctx.rotate(((this.gunAngle - this.angle) * Math.PI) / 180);
    ctx.fillStyle = "#34495e";
    ctx.fillRect(0, -4, this.radius * 1.5, 8);

    ctx.restore();

    // Draw radar cone
    this.renderRadar(ctx);

    // Draw health bar
    const healthBarWidth = this.radius * 2;
    const healthBarHeight = 4;
    const healthBarY = this.y - this.radius - 10;

    ctx.fillStyle = "#e74c3c";
    ctx.fillRect(
      this.x - healthBarWidth / 2,
      healthBarY,
      healthBarWidth,
      healthBarHeight
    );

    ctx.fillStyle = "#2ecc71";
    ctx.fillRect(
      this.x - healthBarWidth / 2,
      healthBarY,
      healthBarWidth * (this.health / this.maxHealth),
      healthBarHeight
    );
  }

  private renderRadar(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate((this.radarAngle * Math.PI) / 180);

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
    ctx.fillStyle = `${this.color}33`;
    ctx.fill();

    // Draw radar outline
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();
  }

  // Robot API methods
  public async ahead(distance: number): Promise<void> {
    this.velocity = distance > 0 ? 100 : -100;
    let remainingDistance = distance;
    let lastTime = performance.now();
    return new Promise((resolve) => {
      const checkDistance = () => {
        const currentTime = performance.now();
        const deltaTime = currentTime - lastTime;
        lastTime = currentTime;

        const step = this.velocity * (deltaTime / 1000);
        remainingDistance -= step;

        // Check if we've overshot
        if (
          (distance > 0 && remainingDistance < 0) ||
          (distance < 0 && remainingDistance > 0)
        ) {
          this.velocity = 0;
          resolve();
          return;
        }
        requestAnimationFrame(checkDistance);
      };
      checkDistance();
    });
  }

  public async turnRight(degrees: number): Promise<void> {
    this.turnRate = 90; // 90 degrees per second
    return new Promise((resolve) => {
      const targetAngle = this.normalizeAngle(this.angle + degrees);
      const checkAngle = () => {
        if (Math.abs(this.angle - targetAngle) <= 1) {
          this.turnRate = 0;
          this.angle = targetAngle;
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
    this.radarTurnRate = 180; // 180 degrees per second
    return new Promise((resolve) => {
      const targetAngle = this.normalizeAngle(this.radarAngle + degrees);
      const checkAngle = () => {
        if (Math.abs(this.radarAngle - targetAngle) <= 1) {
          this.radarTurnRate = 0;
          this.radarAngle = targetAngle;
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
    if (this.energy >= power * 10 && now - this.lastShot >= this.gunCooldown) {
      const bullet = new Bullet(this, power);
      if (this.game) {
        this.game.addBullet(bullet);
      }
      this.energy -= power * 10;
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
      const dx = robot.x - this.x;
      const dy = robot.y - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const angle = this.normalizeAngle(
        (Math.atan2(dy, dx) * 180) / Math.PI - this.radarAngle
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
    this.prevX = this.x;
    this.prevY = this.y;
  }

  public resetToStoredPosition(): void {
    this.x = this.prevX;
    this.y = this.prevY;
  }

  private normalizeAngle(angle: number): number {
    angle = angle % 360;
    return angle < 0 ? angle + 360 : angle;
  }
}
