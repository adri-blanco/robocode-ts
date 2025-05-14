export class Bullet {
    constructor(owner, power) {
        this.owner = owner;
        this.power = Math.min(3, Math.max(0.1, power));
        // Calculate initial position at gun tip
        const gunLength = owner.radius * 1.5;
        const radians = (owner.gunAngle * Math.PI) / 180;
        this.x = owner.x + Math.cos(radians) * gunLength;
        this.y = owner.y + Math.sin(radians) * gunLength;
        // Set velocity based on power (pixels per second)
        this.velocity = 400 + power * 50;
        this.angle = owner.gunAngle;
        // Calculate damage based on power
        this.damage = power * 40;
        // Visual properties
        this.radius = 2 + power;
    }
    update(deltaTime) {
        const radians = (this.angle * Math.PI) / 180;
        this.x += Math.cos(radians) * this.velocity * (deltaTime / 1000);
        this.y += Math.sin(radians) * this.velocity * (deltaTime / 1000);
    }
    render(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        // Draw bullet
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.owner.color;
        ctx.fill();
        // Draw glow effect
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.radius * 2);
        gradient.addColorStop(0, `${this.owner.color}66`);
        gradient.addColorStop(1, "transparent");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius * 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}
//# sourceMappingURL=Bullet.js.map