import { Robot } from "./Robot.js";
import { Bullet } from "./Bullet.js";
import { Game as GameType } from "../types/RobotTypes.js";

export class Game implements GameType {
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;
  public robots: Robot[] = [];
  public bullets: Bullet[] = [];
  public isRunning: boolean = false;
  public isPaused: boolean = false;
  public onUpdate: (() => void) | null = null;

  private lastTime: number = 0;
  private readonly collisionDamage: number = 0.5; // Damage per velocity unit
  private readonly minCollisionDamage: number = 2;
  private readonly maxCollisionDamage: number = 20;
  private readonly deadRobots: string[] = [];

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;

    // Set canvas size
    this.resizeCanvas();
    window.addEventListener("resize", () => this.resizeCanvas());
  }

  private resizeCanvas(): void {
    const container = this.canvas.parentElement;
    if (container) {
      this.canvas.width = container.clientWidth;
      this.canvas.height = container.clientHeight;
    }
  }

  public initialize(): void {
    this.gameLoop(0);
  }

  public start(): void {
    this.isRunning = true;
    this.isPaused = false;
  }

  public togglePause(): void {
    this.isPaused = !this.isPaused;
  }

  public reset(): void {
    this.isRunning = false;
    this.isPaused = false;
    this.robots.forEach((robot) => robot.reset());
  }

  public addRobot(robot: Robot): void {
    this.robots.push(robot);
    robot.game = this;
  }

  public addBullet(bullet: Bullet): void {
    this.bullets.push(bullet);
  }

  public update(deltaTime: number): void {
    if (!this.isRunning || this.isPaused) return;

    // Store previous positions for collision resolution
    this.robots.forEach((robot) => {
      robot.storePreviousPosition();
    });

    // Update robots
    this.robots.forEach((robot) => {
      robot.update(deltaTime);
      this.checkWallCollision(robot);
    });

    // Check and handle robot collisions
    this.handleRobotCollisions();

    // Update bullets
    this.bullets = this.bullets.filter((bullet) => {
      bullet.update(deltaTime);

      // Check if bullet is out of bounds
      if (
        bullet.x < 0 ||
        bullet.x > this.canvas.width ||
        bullet.y < 0 ||
        bullet.y > this.canvas.height
      ) {
        return false;
      }

      // Check for collision with robots
      for (const robot of this.robots) {
        if (
          robot !== bullet.owner &&
          this.checkBulletCollision(bullet, robot)
        ) {
          robot.damage(bullet.damage);
          return false;
        }
      }

      return true;
    });

    this.robots.forEach((robot, i) => {
      if (robot.health <= 0) {
        if (!this.deadRobots.includes(robot.name)) {
          this.robots[i].name =
            "[" +
            (this.robots.length - this.deadRobots.length) +
            "] " +
            robot.name +
            " (DEAD)";
          this.deadRobots.push(robot.name);
        }
      }
    });

    if (this.deadRobots.length === this.robots.length - 1) {
      this.robots.forEach((robot, i) => {
        if (robot.health > 0) {
          this.robots[i].name =
            "[" +
            (this.robots.length - this.deadRobots.length) +
            "] " +
            robot.name +
            " (WINNER)";
        }
      });
    }

    // this.robots = this.robots.filter((robot) => robot.health > 0);

    // Check for game over
    const activeBots = this.robots.filter((robot) => robot.health > 0);
    if (activeBots.length <= 1) {
      this.isRunning = false;
    }

    if (this.onUpdate) {
      this.onUpdate();
    }
  }

  private handleRobotCollisions(): void {
    for (let i = 0; i < this.robots.length; i++) {
      const robotA = this.robots[i];
      if (robotA.health <= 0) continue;

      for (let j = i + 1; j < this.robots.length; j++) {
        const robotB = this.robots[j];
        if (robotB.health <= 0) continue;

        if (this.checkRobotCollision(robotA, robotB)) {
          this.resolveRobotCollision(robotA, robotB);
        }
      }
    }
  }

  private checkRobotCollision(robotA: Robot, robotB: Robot): boolean {
    const dx = robotA.x - robotB.x;
    const dy = robotA.y - robotB.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < robotA.radius + robotB.radius;
  }

  private resolveRobotCollision(robotA: Robot, robotB: Robot): void {
    // Calculate collision normal
    const dx = robotB.x - robotA.x;
    const dy = robotB.y - robotA.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance === 0) return; // Prevent division by zero

    const nx = dx / distance;
    const ny = dy / distance;

    // Calculate relative velocity
    const relativeVelocityX =
      robotB.velocity * Math.cos((robotB.angle * Math.PI) / 180) -
      robotA.velocity * Math.cos((robotA.angle * Math.PI) / 180);
    const relativeVelocityY =
      robotB.velocity * Math.sin((robotB.angle * Math.PI) / 180) -
      robotA.velocity * Math.sin((robotA.angle * Math.PI) / 180);

    const relativeVelocity = Math.sqrt(
      relativeVelocityX * relativeVelocityX +
        relativeVelocityY * relativeVelocityY
    );

    // Calculate collision damage based on relative velocity
    const damage = Math.min(
      this.maxCollisionDamage,
      Math.max(this.minCollisionDamage, relativeVelocity * this.collisionDamage)
    );

    // Apply damage to both robots
    robotA.damage(damage);
    robotB.damage(damage);

    // Trigger collision events
    robotA.onRobotCollision(robotB);
    robotB.onRobotCollision(robotA);

    // Move robots apart to prevent sticking
    const overlap = robotA.radius + robotB.radius - distance;
    if (overlap > 0) {
      robotA.resetToStoredPosition();
      robotB.resetToStoredPosition();

      // Stop both robots
      robotA.stop();
      robotB.stop();

      // Create collision effect
      this.createCollisionEffect(
        robotA.x + robotA.radius * nx,
        robotA.y + robotA.radius * ny
      );
    }
  }

  private createCollisionEffect(x: number, y: number): void {
    // Visual effect for collisions
    this.ctx.save();
    this.ctx.translate(x, y);

    // Draw explosion effect
    const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, 20);
    gradient.addColorStop(0, "rgba(255, 200, 0, 0.8)");
    gradient.addColorStop(1, "rgba(255, 100, 0, 0)");

    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, 20, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.restore();
  }

  public render(): void {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw grid
    this.drawGrid();

    // Draw bullets
    this.bullets.forEach((bullet) => bullet.render(this.ctx));

    // Draw robots
    this.robots.forEach((robot) => robot.render(this.ctx));
  }

  private drawGrid(): void {
    const gridSize = 50;
    const rows = Math.ceil(this.canvas.height / gridSize);
    const cols = Math.ceil(this.canvas.width / gridSize);

    this.ctx.strokeStyle = "rgba(200, 200, 200, 0.2)";
    this.ctx.lineWidth = 1;

    // Draw vertical lines
    for (let i = 0; i <= cols; i++) {
      const x = i * gridSize;
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvas.height);
      this.ctx.stroke();
    }

    // Draw horizontal lines
    for (let i = 0; i <= rows; i++) {
      const y = i * gridSize;
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvas.width, y);
      this.ctx.stroke();
    }
  }

  private gameLoop(timestamp: number): void {
    const deltaTime = timestamp - this.lastTime;
    this.lastTime = timestamp;

    this.update(deltaTime);
    this.render();

    requestAnimationFrame((t) => this.gameLoop(t));
  }

  private checkWallCollision(robot: Robot): void {
    const hitWall =
      robot.x - robot.radius < 0 ||
      robot.x + robot.radius > this.canvas.width ||
      robot.y - robot.radius < 0 ||
      robot.y + robot.radius > this.canvas.height;

    if (hitWall) {
      // Determine which wall was hit and adjust position
      let newX = robot.x;
      let newY = robot.y;

      const buffer = 4;
      if (robot.x - robot.radius < 0) {
        newX = robot.radius + buffer; // Add small buffer
        robot.onHitWall("left");
      } else if (robot.x + robot.radius > this.canvas.width) {
        newX = this.canvas.width - robot.radius - buffer; // Add small buffer
        robot.onHitWall("right");
      }

      if (robot.y - robot.radius < 0) {
        newY = robot.radius + buffer; // Add small buffer
        robot.onHitWall("top");
      } else if (robot.y + robot.radius > this.canvas.height) {
        newY = this.canvas.height - robot.radius - buffer; // Add small buffer
        robot.onHitWall("bottom");
      }

      // Update position and stop the robot
      robot.setPosition(newX, newY);
      robot.stop();

      // Store the new position as the previous position to prevent getting stuck
      robot.storePreviousPosition();
    }
  }

  private checkBulletCollision(bullet: Bullet, robot: Robot): boolean {
    const dx = bullet.x - robot.x;
    const dy = bullet.y - robot.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < robot.radius + bullet.radius;
  }
}
