"""Original Eclipse ambience. No recordings, samples, or third-party melodies.

Periodic layers wrap at loop boundaries, including bell/reverb tails.
Generate with the bundled Python + numpy; output WAV works on Android/Web Audio.
"""
from pathlib import Path
import wave
import numpy as np

RATE = 22050
OUT = Path(__file__).resolve().parents[1] / 'assets' / 'audio'
OUT.mkdir(parents=True, exist_ok=True)
rng = np.random.default_rng(300)

def compose(name, seconds, roots, bells, pulse=False):
    count = RATE * seconds
    t = np.arange(count) / RATE
    result = np.zeros((count, 2))
    # Tuned periodic fundamentals preserve a seamless loop without abrupt resets.
    for voice, frequency in enumerate(roots):
        frequency = round(frequency * seconds) / seconds
        envelope = .70 + .15 * np.sin(2*np.pi*t/seconds + voice*1.7)
        for side in range(2):
            pad = np.zeros(count)
            for harmonic, weight in [(1, .055), (2, .015), (3, .006), (4, .003)]:
                phase = voice*.73 + side*.26
                pad += weight*np.sin(2*np.pi*frequency*harmonic*t+phase)
            result[:, side] += pad*envelope
    # Sparse, inharmonic bell overtones with a diffuse tail rather than a busy melody.
    for start, frequency, amplitude in bells:
        age = np.remainder(t-start, seconds)
        attack = 1-np.exp(-age*42)
        bell = np.zeros(count)
        for ratio, weight, decay in [(1,1,1.5),(2.01,.32,2.1),(2.76,.16,3.5),(4.07,.07,5)]:
            bell += weight*np.sin(2*np.pi*frequency*ratio*age)*np.exp(-age*decay)
        bell *= attack*amplitude
        for side in range(2):
            result[:,side] += bell
            for delay, gain in [(int(.19*RATE),.21),(int(.37*RATE),.16),(int(.61*RATE),.12),(int(.97*RATE),.08)]:
                result[:,side] += np.roll(bell,delay+side*101)*gain
    if pulse:
        # Muted frame-drum weight, not a high-frequency arcade beat.
        for start in np.arange(0, seconds, 1.6):
            age=np.remainder(t-start,seconds)
            hit=np.sin(2*np.pi*(82*age-16*age*age))*np.exp(-age*12)*(1-np.exp(-age*120))*.035
            result += hit[:,None]
    # Very quiet filtered air, periodic by construction.
    spectrum = rng.normal(size=48)
    for i, amplitude in enumerate(spectrum):
        hz=(i+4)/seconds
        result += (np.sin(2*np.pi*hz*t+i)*amplitude*.0003)[:,None]
    result = np.tanh(result*1.7)
    peak=np.max(np.abs(result))
    if peak>.62: result*=.62/peak
    pcm=(result*32767).astype('<i2')
    with wave.open(str(OUT/(name+'.wav')), 'wb') as target:
        target.setnchannels(2);target.setsampwidth(2);target.setframerate(RATE);target.writeframes(pcm.tobytes())
    print(name, seconds, 'seconds, peak', round(float(np.max(np.abs(result))),3))

compose('title',24,[110,164.81,220],[(2,440,.09),(14,329.63,.06)])
compose('explore',48,[110,146.83,164.81,220],[(4,440,.06),(21,293.66,.055),(37,392,.04)])
compose('boss',32,[98,146.83,196,207.65],[(3,293.66,.08),(16,220,.075),(25,311.13,.06)],True)
