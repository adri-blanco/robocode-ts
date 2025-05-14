import { Bullet } from "./Bullet.js";
export class Robot {
    constructor(name, config) {
        this.velocity = 0;
        this.turnRate = 0;
        this.radarTurnRate = 0;
        this.scannedRobots = [];
        // Constants
        this.radius = 20;
        this.maxHealth = 100;
        this.maxEnergy = 100;
        this.gunCooldown = 500; // milliseconds
        this.radarWidth = 45; // degrees
        this.radarRange = 400; // pixels
        this.collisionCooldown = 0;
        this.lastCollision = null;
        this.lastShot = 0;
        // Reference to game instance
        this.game = null;
        // AI script context
        this.script = null;
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
    reset() {
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
    damage(amount) {
        this.health = Math.max(0, this.health - amount);
        this.onHit();
    }
    async update(deltaTime) {
        if (this.health <= 0)
            return;
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
        this.energy = Math.min(this.maxEnergy, this.energy + (deltaTime / 1000) * 10);
        // Execute AI script if available
        if (this.script) {
            try {
                await this.script.tick(deltaTime);
            }
            catch (error) {
                console.error(`Error in robot ${this.name} script:`, error);
            }
        }
    }
    render(ctx) {
        if (this.health <= 0)
            return;
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
        ctx.strokeRect(-this.radius, -this.radius, this.radius * 2, this.radius * 2);
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
        ctx.fillRect(this.x - healthBarWidth / 2, healthBarY, healthBarWidth, healthBarHeight);
        ctx.fillStyle = "#2ecc71";
        ctx.fillRect(this.x - healthBarWidth / 2, healthBarY, healthBarWidth * (this.health / this.maxHealth), healthBarHeight);
    }
    renderRadar(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate((this.radarAngle * Math.PI) / 180);
        // Draw radar cone
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, this.radarRange, ((-this.radarWidth / 2) * Math.PI) / 180, ((this.radarWidth / 2) * Math.PI) / 180);
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
    async ahead(distance) {
        this.velocity = distance > 0 ? 100 : -100;
        return new Promise((resolve) => {
            const checkDistance = () => {
                console.log("checkDistance", distance);
                if (Math.abs(distance) <= 0) {
                    this.velocity = 0;
                    resolve();
                }
                else {
                    distance -= this.velocity * (1 / 60);
                    requestAnimationFrame(checkDistance);
                }
            };
            checkDistance();
        });
    }
    async turnRight(degrees) {
        this.turnRate = 90; // 90 degrees per second
        return new Promise((resolve) => {
            const targetAngle = this.normalizeAngle(this.angle + degrees);
            const checkAngle = () => {
                if (Math.abs(this.angle - targetAngle) <= 1) {
                    this.turnRate = 0;
                    this.angle = targetAngle;
                    resolve();
                }
                else {
                    requestAnimationFrame(checkAngle);
                }
            };
            checkAngle();
        });
    }
    async turnLeft(degrees) {
        return this.turnRight(-degrees);
    }
    async turnRadarRight(degrees) {
        this.radarTurnRate = 180; // 180 degrees per second
        return new Promise((resolve) => {
            const targetAngle = this.normalizeAngle(this.radarAngle + degrees);
            const checkAngle = () => {
                if (Math.abs(this.radarAngle - targetAngle) <= 1) {
                    this.radarTurnRate = 0;
                    this.radarAngle = targetAngle;
                    resolve();
                }
                else {
                    requestAnimationFrame(checkAngle);
                }
            };
            checkAngle();
        });
    }
    async turnRadarLeft(degrees) {
        return this.turnRadarRight(-degrees);
    }
    fire(power) {
        console.log("Firing", power);
        const now = Date.now();
        if (this.energy >= power * 10 && now - this.lastShot >= this.gunCooldown) {
            const bullet = new Bullet(this, power);
            if (this.game) {
                this.game.addBullet(bullet);
            }
            this.energy -= power * 10;
            this.lastShot = now;
        }
        else {
            console.log("Not enough energy to fire");
        }
    }
    scan() {
        this.scannedRobots = [];
        if (!this.game)
            return [];
        // Get all robots except self
        const otherRobots = this.game.robots.filter((r) => r !== this && r.health > 0);
        otherRobots.forEach((robot) => {
            // Calculate angle to robot
            const dx = robot.x - this.x;
            const dy = robot.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const angle = this.normalizeAngle((Math.atan2(dy, dx) * 180) / Math.PI - this.radarAngle);
            // Check if robot is within radar range and arc
            if (distance <= this.radarRange &&
                Math.abs(angle) <= this.radarWidth / 2) {
                const scannedInfo = {
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
    onHit() {
        if (this.script?.onHit) {
            this.script.onHit();
        }
    }
    onScannedRobot(robot) {
        if (this.script?.onScannedRobot) {
            this.script.onScannedRobot(robot);
        }
    }
    onRobotCollision(robot) {
        // Set collision cooldown for visual effect
        this.collisionCooldown = 500; // 500ms
        this.lastCollision = robot;
        if (this.script?.onRobotCollision) {
            this.script.onRobotCollision(robot);
        }
    }
    onHitWall(wall) {
        if (this.script?.onHitWall) {
            this.script.onHitWall(wall);
        }
    }
    getLastCollision() {
        return this.lastCollision;
    }
    storePreviousPosition() {
        this.prevX = this.x;
        this.prevY = this.y;
    }
    resetToStoredPosition() {
        this.x = this.prevX;
        this.y = this.prevY;
    }
    normalizeAngle(angle) {
        angle = angle % 360;
        return angle < 0 ? angle + 360 : angle;
    }
}
//# sourceMappingURL=Robot.js.map