export class Game {
    constructor(canvas) {
        this.robots = [];
        this.bullets = [];
        this.isRunning = false;
        this.isPaused = false;
        this.onUpdate = null;
        this.lastTime = 0;
        this.collisionDamage = 0.5; // Damage per velocity unit
        this.minCollisionDamage = 2;
        this.maxCollisionDamage = 20;
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        // Set canvas size
        this.resizeCanvas();
        window.addEventListener("resize", () => this.resizeCanvas());
    }
    resizeCanvas() {
        const container = this.canvas.parentElement;
        if (container) {
            this.canvas.width = container.clientWidth;
            this.canvas.height = container.clientHeight;
        }
    }
    initialize() {
        this.gameLoop(0);
    }
    start() {
        this.isRunning = true;
        this.isPaused = false;
    }
    togglePause() {
        this.isPaused = !this.isPaused;
    }
    reset() {
        this.isRunning = false;
        this.isPaused = false;
        this.robots.forEach((robot) => robot.reset());
    }
    addRobot(robot) {
        this.robots.push(robot);
        robot.game = this;
    }
    addBullet(bullet) {
        this.bullets.push(bullet);
    }
    update(deltaTime) {
        if (!this.isRunning || this.isPaused)
            return;
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
            if (bullet.x < 0 ||
                bullet.x > this.canvas.width ||
                bullet.y < 0 ||
                bullet.y > this.canvas.height) {
                return false;
            }
            // Check for collision with robots
            for (const robot of this.robots) {
                if (robot !== bullet.owner &&
                    this.checkBulletCollision(bullet, robot)) {
                    robot.damage(bullet.damage);
                    return false;
                }
            }
            return true;
        });
        // Check for game over
        const activeBots = this.robots.filter((robot) => robot.health > 0);
        if (activeBots.length <= 1) {
            this.isRunning = false;
        }
        if (this.onUpdate) {
            this.onUpdate();
        }
    }
    handleRobotCollisions() {
        for (let i = 0; i < this.robots.length; i++) {
            const robotA = this.robots[i];
            if (robotA.health <= 0)
                continue;
            for (let j = i + 1; j < this.robots.length; j++) {
                const robotB = this.robots[j];
                if (robotB.health <= 0)
                    continue;
                if (this.checkRobotCollision(robotA, robotB)) {
                    this.resolveRobotCollision(robotA, robotB);
                }
            }
        }
    }
    checkRobotCollision(robotA, robotB) {
        const dx = robotA.x - robotB.x;
        const dy = robotA.y - robotB.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < robotA.radius + robotB.radius;
    }
    resolveRobotCollision(robotA, robotB) {
        // Calculate collision normal
        const dx = robotB.x - robotA.x;
        const dy = robotB.y - robotA.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance === 0)
            return; // Prevent division by zero
        const nx = dx / distance;
        const ny = dy / distance;
        // Calculate relative velocity
        const relativeVelocityX = robotB.velocity * Math.cos((robotB.angle * Math.PI) / 180) -
            robotA.velocity * Math.cos((robotA.angle * Math.PI) / 180);
        const relativeVelocityY = robotB.velocity * Math.sin((robotB.angle * Math.PI) / 180) -
            robotA.velocity * Math.sin((robotA.angle * Math.PI) / 180);
        const relativeVelocity = Math.sqrt(relativeVelocityX * relativeVelocityX +
            relativeVelocityY * relativeVelocityY);
        // Calculate collision damage based on relative velocity
        const damage = Math.min(this.maxCollisionDamage, Math.max(this.minCollisionDamage, relativeVelocity * this.collisionDamage));
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
            robotA.velocity = 0;
            robotB.velocity = 0;
            // Create collision effect
            this.createCollisionEffect(robotA.x + robotA.radius * nx, robotA.y + robotA.radius * ny);
        }
    }
    createCollisionEffect(x, y) {
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
    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        // Draw grid
        this.drawGrid();
        // Draw bullets
        this.bullets.forEach((bullet) => bullet.render(this.ctx));
        // Draw robots
        this.robots.forEach((robot) => robot.render(this.ctx));
    }
    drawGrid() {
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
    gameLoop(timestamp) {
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;
        this.update(deltaTime);
        this.render();
        requestAnimationFrame((t) => this.gameLoop(t));
    }
    checkWallCollision(robot) {
        const hitWall = robot.x - robot.radius < 0 ||
            robot.x + robot.radius > this.canvas.width ||
            robot.y - robot.radius < 0 ||
            robot.y + robot.radius > this.canvas.height;
        if (hitWall) {
            // Determine which wall was hit
            if (robot.x - robot.radius < 0) {
                robot.x = robot.radius;
                robot.onHitWall("left");
            }
            else if (robot.x + robot.radius > this.canvas.width) {
                robot.x = this.canvas.width - robot.radius;
                robot.onHitWall("right");
            }
            if (robot.y - robot.radius < 0) {
                robot.y = robot.radius;
                robot.onHitWall("top");
            }
            else if (robot.y + robot.radius > this.canvas.height) {
                robot.y = this.canvas.height - robot.radius;
                robot.onHitWall("bottom");
            }
            robot.velocity = 0;
        }
    }
    checkBulletCollision(bullet, robot) {
        const dx = bullet.x - robot.x;
        const dy = bullet.y - robot.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < robot.radius + bullet.radius;
    }
}
//# sourceMappingURL=Game.js.map