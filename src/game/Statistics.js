export class Statistics {
  constructor() {
    this.reset();
  }

  reset() {
    this.stats = {
      totalDamageDealt: 0,
      totalDamageTaken: 0,
      bulletsHit: 0,
      bulletsFired: 0,
      collisions: 0,
      wallHits: 0,
      totalDistance: 0,
      survivalTime: 0,
      kills: 0,
      victories: 0,
      battlesPlayed: 0,
      energyUsed: 0,
      maxDamageDealt: 0,
      longestSurvivalTime: 0,
      averageEnergy: 0,
      energyReadings: [],
      positionHeatmap: this.createHeatmap(),
      damageLocations: [],
    };
  }

  createHeatmap(gridSize = 50) {
    const heatmap = [];
    for (let i = 0; i < gridSize; i++) {
      heatmap[i] = [];
      for (let j = 0; j < gridSize; j++) {
        heatmap[i][j] = 0;
      }
    }
    return heatmap;
  }

  // Event tracking methods
  onDamageDealt(amount, target) {
    this.stats.totalDamageDealt += amount;
    this.stats.maxDamageDealt = Math.max(this.stats.maxDamageDealt, amount);
  }

  onDamageTaken(amount, source, x, y) {
    this.stats.totalDamageTaken += amount;
    this.stats.damageLocations.push({ x, y, amount });
  }

  onBulletFired() {
    this.stats.bulletsFired++;
  }

  onBulletHit() {
    this.stats.bulletsHit++;
  }

  onCollision() {
    this.stats.collisions++;
  }

  onWallHit() {
    this.stats.wallHits++;
  }

  onMove(distance) {
    this.stats.totalDistance += Math.abs(distance);
  }

  onEnergyUsed(amount) {
    this.stats.energyUsed += amount;
  }

  onEnergyReading(amount) {
    this.stats.energyReadings.push(amount);
    this.stats.averageEnergy =
      this.stats.energyReadings.reduce((a, b) => a + b, 0) /
      this.stats.energyReadings.length;
  }

  updatePosition(x, y, gridSize, canvasWidth, canvasHeight) {
    const gridX = Math.floor((x / canvasWidth) * gridSize);
    const gridY = Math.floor((y / canvasHeight) * gridSize);
    if (gridX >= 0 && gridX < gridSize && gridY >= 0 && gridY < gridSize) {
      this.stats.positionHeatmap[gridX][gridY]++;
    }
  }

  onKill() {
    this.stats.kills++;
  }

  onVictory() {
    this.stats.victories++;
  }

  onBattleEnd(survivalTime) {
    this.stats.battlesPlayed++;
    this.stats.survivalTime += survivalTime;
    this.stats.longestSurvivalTime = Math.max(
      this.stats.longestSurvivalTime,
      survivalTime
    );
  }

  // Analysis methods
  getAccuracy() {
    return this.stats.bulletsFired > 0
      ? (this.stats.bulletsHit / this.stats.bulletsFired) * 100
      : 0;
  }

  getDamageEfficiency() {
    return this.stats.totalDamageTaken > 0
      ? this.stats.totalDamageDealt / this.stats.totalDamageTaken
      : Infinity;
  }

  getVictoryRate() {
    return this.stats.battlesPlayed > 0
      ? (this.stats.victories / this.stats.battlesPlayed) * 100
      : 0;
  }

  getAverageLifespan() {
    return this.stats.battlesPlayed > 0
      ? this.stats.survivalTime / this.stats.battlesPlayed
      : 0;
  }

  getKillDeathRatio() {
    return this.stats.battlesPlayed - this.stats.victories > 0
      ? this.stats.kills / (this.stats.battlesPlayed - this.stats.victories)
      : this.stats.kills;
  }

  getMostDangerousLocations(top = 5) {
    return [...this.stats.damageLocations]
      .sort((a, b) => b.amount - a.amount)
      .slice(0, top);
  }

  getPreferredPositions(threshold = 0.7) {
    const maxVisits = Math.max(...this.stats.positionHeatmap.flat());
    const hotspots = [];

    this.stats.positionHeatmap.forEach((row, x) => {
      row.forEach((visits, y) => {
        if (visits >= maxVisits * threshold) {
          hotspots.push({ x, y, visits });
        }
      });
    });

    return hotspots;
  }

  // Summary generation
  generateSummary() {
    return {
      accuracy: this.getAccuracy().toFixed(2) + "%",
      damageEfficiency: this.getDamageEfficiency().toFixed(2),
      victoryRate: this.getVictoryRate().toFixed(2) + "%",
      averageLifespan: (this.getAverageLifespan() / 1000).toFixed(2) + "s",
      killDeathRatio: this.getKillDeathRatio().toFixed(2),
      totalBattles: this.stats.battlesPlayed,
      totalDamageDealt: Math.round(this.stats.totalDamageDealt),
      totalDamageTaken: Math.round(this.stats.totalDamageTaken),
      averageEnergy: this.stats.averageEnergy.toFixed(2),
      totalDistance: Math.round(this.stats.totalDistance),
      collisions: this.stats.collisions,
      wallHits: this.stats.wallHits,
      dangerousLocations: this.getMostDangerousLocations(),
      preferredPositions: this.getPreferredPositions(),
    };
  }
}
