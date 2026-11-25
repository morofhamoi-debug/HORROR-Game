export class HUD {
  constructor() {
    this.floor = document.getElementById('floor-label');
    this.floorNumber = document.getElementById('floor-number');
    this.interaction = document.getElementById('interaction');
    this.interactionLabel = document.getElementById('interaction-label');
    this.quality = document.getElementById('quality-label');
    this.room = document.getElementById('room-label');
    this.objective = document.getElementById('objective-text');
    this.clock = document.getElementById('clock');
    this.tickClock();
    this.clockTimer = window.setInterval(() => this.tickClock(), 1000);
  }

  tickClock() {
    const now = new Date();
    this.clock.textContent = String(now.getHours()).padStart(2, '0') + ':' +
      String(now.getMinutes()).padStart(2, '0');
  }

  setQuality(value) { this.quality.textContent = value; }
  setObjective(value) { this.objective.textContent = value; }
  setRoom(value) {
    if (this.room && this.room.textContent !== value) this.room.textContent = value;
  }

  setFloor(level) {
    this.floor.textContent = level > 0 ? 'ВТОРОЙ ЭТАЖ' : level < 0 ? 'ПОДВАЛ' : 'ПЕРВЫЙ ЭТАЖ';
    this.floorNumber.textContent = level > 0 ? '02' : level < 0 ? 'B1' : '01';
  }

  setInteraction(label) {
    this.interactionLabel.textContent = label;
    this.interaction.classList.toggle('hidden', !label);
  }

  dispose() {
    if (this.clockTimer !== null) {
      window.clearInterval(this.clockTimer);
      this.clockTimer = null;
    }
  }
}
