export interface RobotConfig {
  name: string;
  x: number;
  y: number;
  angle: number;
  color: string;
}

export interface ScannedRobotInfo {
  name: string;
  distance: number;
  angle: number;
  energy: number;
  velocity: number;
}

export interface RobotAI {
  robot: Robot;
  tick(deltaTime: number): Promise<void>;
  onScannedRobot?(robot: ScannedRobotInfo): void;
  onHit?(): void;
  onRobotCollision?(robot: Robot): void;
  onHitWall?(wall: "top" | "right" | "bottom" | "left"): void;
}

export interface Bullet {
  owner: Robot;
  power: number;
  x: number;
  y: number;
  velocity: number;
  angle: number;
  damage: number;
  radius: number;
  update(deltaTime: number): void;
  render(ctx: CanvasRenderingContext2D): void;
}

export interface Robot {
  name: string;
  x: number;
  y: number;
  angle: number;
  color: string;
  health: number;
  energy: number;
  velocity: number;
  turnRate: number;
  gunAngle: number;
  radarAngle: number;
  radarTurnRate: number;
  radarWidth: number;
  radarRange: number;
  maxHealth: number;
  maxEnergy: number;
  radius: number;
  game: Game | null;
  script: RobotAI | null;

  ahead(distance: number): Promise<void>;
  turnRight(degrees: number): Promise<void>;
  turnLeft(degrees: number): Promise<void>;
  turnRadarRight(degrees: number): Promise<void>;
  turnRadarLeft(degrees: number): Promise<void>;
  fire(power: number): void;
  scan(): ScannedRobotInfo[];
  damage(amount: number): void;
  update(deltaTime: number): void;
  render(ctx: CanvasRenderingContext2D): void;
  reset(): void;
  onHit(): void;
  onScannedRobot(robot: ScannedRobotInfo): void;
  onRobotCollision(robot: Robot): void;
  onHitWall(wall: "top" | "right" | "bottom" | "left"): void;
  getLastCollision(): Robot | null;
}

export interface Game {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  robots: Robot[];
  bullets: Bullet[];
  isRunning: boolean;
  isPaused: boolean;
  onUpdate: (() => void) | null;

  initialize(): void;
  start(): void;
  reset(): void;
  togglePause(): void;
  addRobot(robot: Robot): void;
  addBullet(bullet: Bullet): void;
  update(deltaTime: number): void;
  render(): void;
}
