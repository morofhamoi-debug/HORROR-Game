export class HUD {
  constructor() {
    this.floor = document.getElementById('floor-label');
    this.floorNumber = document.getElementById('floor-number');
    this.interaction = document.getElementById('interaction');
    this.interactionLabel = document.getElementById('interaction-label');
    this.quality = document.getElementById('quality-label');
    this.objective = document.getElementById('objective-text');
    this.clock = document.getElementById('clock');
    this.seconds = 43; this.minutes = 21;
    this.tickClock();
    this.clockTimer = setInterval(() => this.tickClock(), 18000);
  }
  tickClock() {
    this.minutes += 1;
    if (this.minutes >= 60) { this.minutes = 0; this.seconds = (this.seconds + 1) % 60; }
    this.clock.textContent = String(this.minutes).padStart(2, '0') + ':' + String(this.seconds).padStart(2, '0');
  }
  setQuality(value) { this.quality.textContent = value; }
  setObjective(value) { this.objective.textContent = value; }
  setFloor(level) {
    this.floor.textContent = level > 0 ? 'ВТОРОЙ ЭТАЖ' : level < 0 ? 'ПОДВАЛ' : 'ПЕРВЫЙ ЭТАЖ';
    this.floorNumber.textContent = level > 0 ? '02' : level < 0 ? 'B1' : '01';
  }
  setInteraction(label) {
    this.interactionLabel.textContent = label;
    this.interaction.classList.toggle('hidden', !label);
  }
}