export function createAudioManager() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  const button = document.querySelector('#sound-toggle');
  let context = null;
  let master = null;
  let effects = null;
  let ambience = null;
  let noiseBuffer = null;
  let started = false;
  let muted = false;
  let ambienceTime = 0;
  let nextCreakAt = 17;

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  function ensureContext() {
    if (!AudioContextClass) return false;
    if (context) return true;

    try {
      context = new AudioContextClass();
    } catch (error) {
      console.warn('AudioContext is unavailable:', error);
      return false;
    }
    master = context.createGain();
    master.gain.value = muted ? 0 : 0.72;
    effects = context.createGain();
    effects.gain.value = 0.86;
    ambience = context.createGain();
    ambience.gain.value = 0.34;

    const compressor = context.createDynamicsCompressor();
    compressor.threshold.value = -20;
    compressor.knee.value = 16;
    compressor.ratio.value = 3;
    compressor.attack.value = 0.012;
    compressor.release.value = 0.28;

    effects.connect(master);
    ambience.connect(master);
    master.connect(compressor);
    compressor.connect(context.destination);

    noiseBuffer = context.createBuffer(1, context.sampleRate * 2, context.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < data.length; i++) {
      const white = Math.random() * 2 - 1;
      last = last * 0.92 + white * 0.08;
      data[i] = clamp(white * 0.48 + last * 0.9, -1, 1);
    }
    return true;
  }

  function setParam(param, value, time, curve = 'linear') {
    if (!param || !context) return;
    const now = context.currentTime;
    param.cancelScheduledValues(now);
    param.setValueAtTime(param.value, now);
    if (curve === 'exponential' && value > 0) {
      param.exponentialRampToValueAtTime(value, now + time);
    } else {
      param.linearRampToValueAtTime(value, now + time);
    }
  }

  function connectSpatial(node, position, destination = effects) {
    if (!position || !context.createPanner) {
      node.connect(destination);
      return null;
    }
    const panner = context.createPanner();
    panner.panningModel = 'HRTF';
    panner.distanceModel = 'inverse';
    panner.refDistance = 1.1;
    panner.maxDistance = 18;
    panner.rolloffFactor = 1.15;
    if (panner.positionX && panner.positionY && panner.positionZ) {
      panner.positionX.value = position.x;
      panner.positionY.value = position.y ?? 0.2;
      panner.positionZ.value = position.z;
    } else {
      panner.setPosition(position.x, position.y ?? 0.2, position.z);
    }
    node.connect(panner);
    panner.connect(destination);
    return panner;
  }

  function noiseBurst({ position, duration = 0.16, gain = 0.1, frequency = 700, q = 0.8, type = 'bandpass', destination = effects }) {
    if (!started || !context || !noiseBuffer) return;
    const source = context.createBufferSource();
    source.buffer = noiseBuffer;
    const filter = context.createBiquadFilter();
    filter.type = type;
    filter.frequency.setValueAtTime(frequency, context.currentTime);
    filter.Q.value = q;
    const envelope = context.createGain();
    const now = context.currentTime;
    envelope.gain.setValueAtTime(0.0001, now);
    envelope.gain.linearRampToValueAtTime(gain, now + Math.min(0.018, duration * 0.2));
    envelope.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    source.connect(filter);
    filter.connect(envelope);
    const panner = connectSpatial(envelope, position, destination);
    source.onended = () => {
      source.disconnect();
      filter.disconnect();
      envelope.disconnect();
      panner?.disconnect();
    };
    source.start(now);
    source.stop(now + duration + 0.025);
  }

  function tone({ position, frequency = 120, endFrequency, duration = 0.12, gain = 0.08, wave = 'sine', destination = effects }) {
    if (!started || !context) return;
    const oscillator = context.createOscillator();
    const envelope = context.createGain();
    const now = context.currentTime;
    oscillator.type = wave;
    oscillator.frequency.setValueAtTime(Math.max(1, frequency), now);
    if (endFrequency) oscillator.frequency.exponentialRampToValueAtTime(Math.max(1, endFrequency), now + duration);
    envelope.gain.setValueAtTime(0.0001, now);
    envelope.gain.linearRampToValueAtTime(gain, now + 0.008);
    envelope.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    oscillator.connect(envelope);
    const panner = connectSpatial(envelope, position, destination);
    oscillator.onended = () => {
      oscillator.disconnect();
      envelope.disconnect();
      panner?.disconnect();
    };
    oscillator.start(now);
    oscillator.stop(now + duration + 0.025);
  }

  function startAmbience() {
    const air = context.createBufferSource();
    air.buffer = noiseBuffer;
    air.loop = true;
    const lowPass = context.createBiquadFilter();
    lowPass.type = 'lowpass';
    lowPass.frequency.value = 170;
    lowPass.Q.value = 0.45;
    const airGain = context.createGain();
    airGain.gain.value = 0.19;
    air.connect(lowPass);
    lowPass.connect(airGain);
    airGain.connect(ambience);
    air.start();

    const hum = context.createOscillator();
    hum.type = 'sine';
    hum.frequency.value = 49.8;
    const humGain = context.createGain();
    humGain.gain.value = 0.012;
    hum.connect(humGain);
    humGain.connect(ambience);
    hum.start();

    const upperHum = context.createOscillator();
    upperHum.type = 'sine';
    upperHum.frequency.value = 99.6;
    const upperGain = context.createGain();
    upperGain.gain.value = 0.003;
    upperHum.connect(upperGain);
    upperGain.connect(ambience);
    upperHum.start();
  }

  async function start() {
    if (!ensureContext()) {
      if (button) {
        button.textContent = 'ЗВУК НЕДОСТУПЕН';
        button.disabled = true;
      }
      return false;
    }
    try {
      await context.resume();
      if (!started) {
        started = true;
        startAmbience();
        if (button) button.textContent = muted ? 'ЗВУК: ВЫКЛ' : 'ЗВУК: ВКЛ';
      }
      return true;
    } catch (error) {
      console.warn('Audio could not be started:', error);
      return false;
    }
  }

  function setMuted(value) {
    muted = Boolean(value);
    if (master && context) {
      setParam(master.gain, muted ? 0 : 0.72, 0.12);
      if (!muted && context.state === 'suspended') context.resume().catch(() => {});
    }
    if (button) {
      button.textContent = muted ? 'ЗВУК: ВЫКЛ' : 'ЗВУК: ВКЛ';
      button.classList.toggle('active', muted);
      button.setAttribute('aria-pressed', String(muted));
    }
  }

  button?.addEventListener('click', () => setMuted(!muted));

  function playFootstep(surface, position, intensity = 1) {
    const profiles = {
      wood: { frequency: 520, q: .72, noise: .14, thud: 92, thudGain: .105, duration: .15 },
      tile: { frequency: 1280, q: 1.15, noise: .13, thud: 145, thudGain: .09, duration: .12 },
      carpet: { frequency: 260, q: .55, noise: .07, thud: 68, thudGain: .075, duration: .19 },
      stone: { frequency: 1650, q: 1.4, noise: .12, thud: 118, thudGain: .09, duration: .13 }
    };
    const p = profiles[surface] || profiles.wood;
    noiseBurst({
      position,
      duration: p.duration,
      gain: p.noise * intensity,
      frequency: p.frequency,
      q: p.q
    });
    tone({
      position,
      frequency: p.thud,
      endFrequency: p.thud * 0.72,
      duration: p.duration * 0.8,
      gain: p.thudGain * intensity,
      wave: 'sine'
    });
  }

  function playDoor(opening, position) {
    if (!started) return;
    const duration = opening ? .82 : .46;
    noiseBurst({
      position,
      duration,
      gain: opening ? .16 : .12,
      frequency: opening ? 430 : 620,
      q: .68,
      type: 'lowpass'
    });
    tone({
      position,
      frequency: opening ? 145 : 112,
      endFrequency: opening ? 62 : 76,
      duration,
      gain: opening ? .055 : .085,
      wave: 'sawtooth'
    });
    if (!opening) {
      window.setTimeout(() => {
        tone({ position, frequency: 82, endFrequency: 48, duration: .12, gain: .12 });
        noiseBurst({ position, duration: .07, gain: .12, frequency: 210, q: .8, type: 'lowpass' });
      }, 220);
    }
  }

  function playSwitch(isOn, position) {
    noiseBurst({ position, duration: .045, gain: .13, frequency: 1900, q: 2.2 });
    tone({ position, frequency: isOn ? 820 : 560, endFrequency: isOn ? 1180 : 360, duration: .055, gain: .035, wave: 'square' });
  }

  function playFlashlight(isOn) {
    noiseBurst({ duration: .035, gain: .11, frequency: 2400, q: 1.8 });
    tone({ frequency: isOn ? 1550 : 1050, endFrequency: isOn ? 880 : 620, duration: .045, gain: .028, wave: 'triangle' });
  }

  function playInspect(position) {
    noiseBurst({ position, duration: .22, gain: .055, frequency: 2100, q: .55, type: 'highpass' });
  }

  function playHouseCreak(position) {
    const startFrequency = 76 + Math.random() * 42;
    tone({
      position,
      frequency: startFrequency,
      endFrequency: startFrequency * (.72 + Math.random() * .16),
      duration: .85 + Math.random() * .8,
      gain: .018,
      wave: 'triangle',
      destination: ambience
    });
    noiseBurst({
      position,
      duration: .42,
      gain: .012,
      frequency: 380,
      q: .45,
      type: 'lowpass',
      destination: ambience
    });
  }

  function update(delta, camera, directionTarget) {
    if (!started || !context) return;
    const listener = context.listener;
    const position = camera.position;
    const direction = camera.getWorldDirection(directionTarget);
    if (listener.positionX && listener.forwardX && listener.upX) {
      listener.positionX.value = position.x;
      listener.positionY.value = position.y;
      listener.positionZ.value = position.z;
      listener.forwardX.value = direction.x;
      listener.forwardY.value = direction.y;
      listener.forwardZ.value = direction.z;
      listener.upX.value = 0;
      listener.upY.value = 1;
      listener.upZ.value = 0;
    } else {
      listener.setPosition(position.x, position.y, position.z);
      listener.setOrientation(direction.x, direction.y, direction.z, 0, 1, 0);
    }

    ambienceTime += delta;
    if (ambienceTime >= nextCreakAt) {
      ambienceTime = 0;
      nextCreakAt = 18 + Math.random() * 19;
      const angle = Math.random() * Math.PI * 2;
      const distance = 3.2 + Math.random() * 5.5;
      playHouseCreak({
        x: clamp(position.x + Math.cos(angle) * distance, -5.5, 5.5),
        y: 1.8 + Math.random() * .7,
        z: clamp(position.z + Math.sin(angle) * distance, -4.5, 4.5)
      });
    }
  }

  return {
    start,
    update,
    setMuted,
    isMuted: () => muted,
    isAvailable: () => Boolean(AudioContextClass),
    playFootstep,
    playDoor,
    playSwitch,
    playFlashlight,
    playInspect
  };
}
