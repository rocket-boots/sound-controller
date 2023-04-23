import { Howl, Howler } from 'howler';
import { Random } from 'rocket-utility-belt';

class SoundController {
	/**
	 * @param {*} soundsListing - an object containing keys of sound names and values of
	 * either strings (of source audio file urls), objects (e.g., howler sounds), or functions
	 * (for custom audio), or an array of any of the above. An array indicates a random choice
	 * between a number of different sounds.
	 */
	constructor(soundsListing = {}, musicListing = {}) {
		this.Howl = Howl;
		this.Howler = Howler;
		this.sounds = {};
		this.setupSounds(soundsListing);
		this.music = musicListing;
		this.musicNowPlaying = null;
		this.ambienceNowPlaying = null;
		this.volume = 1;
		this.isSoundsOn = true;
		this.isMusicOn = true;
		this.playlist = [];
		this.playlistIndex = 0;
		this.musicPlaying = null;
	}

	stopMusic() {
		if (!this.musicNowPlaying) return;
		if (typeof this.musicNowPlaying.stop !== 'function') {
			throw new Error('Could not stop music playing');
		}
		this.musicNowPlaying.stop();
	}

	stopAmbience() {
		if (!this.ambienceNowPlaying) return;
		if (typeof this.ambienceNowPlaying.stop !== 'function') {
			throw new Error('Could not stop music playing');
		}
		this.ambienceNowPlaying.stop();
	}

	turnSoundsOn(on = true) {
		this.isSoundsOn = on;
		if (!this.isSoundsOn) {
			this.stopAmbience();
		}
	}

	turnSoundsOff(off = true) { this.turnSoundsOn(!off); }

	turnMusicOn(on = true) {
		this.isMusicOn = on;
		if (!this.isMusicOn) {
			this.stopMusic();
		}
	}

	turnMusicOff(off = true) { this.turnMusicOn(!off); }

	setupSounds(soundsListing = {}) {
		Object.keys(soundsListing).forEach((key) => {
			const listingValue = soundsListing[key];
			if (listingValue instanceof Array) {
				this.sounds[key] = listingValue.map((item) => (
					(typeof item === 'string') ? this.makeHowlSound(item) : item
				));
				return;
			}
			this.sounds[key] = (typeof listingValue === 'string') ? this.makeHowlSound(listingValue) : listingValue;
		});
	}

	makeHowlSound(src, howlOptions = {}) {
		return new this.Howl({ src: [src], ...howlOptions });
	}

	playHowl(src, howlOptions = {}) {
		if (!this.isSoundsOn) return null;
		const sound = this.makeHowlSound(src, howlOptions);
		sound.play();
		return sound;
	}

	/**
	 * Play a sound from a function, array, object (w/ play method), or string (via Howler);
	 * Meant to be an internal function
	 */
	playThing(soundThing, soundName, howlOptions = {}) {
		const typeOfSound = typeof soundThing;
		if (typeOfSound === 'function') {
			return soundThing(soundName);
		}
		if (soundThing instanceof Array) {
			const chosenSoundThing = Random.pick(soundThing);
			return this.playThing(chosenSoundThing, soundName);
		}
		if (typeOfSound === 'object') {
			soundThing.play();
			return () => soundThing.stop();
		}
		if (typeOfSound === 'string') {
			return this.playHowl(soundThing, howlOptions);
		}
		return null;
	}

	static wait(delayMs) {
		return new Promise((resolve) => {
			window.setTimeout(resolve, delayMs);
		});
	}

	async play(soundName, options = {}) {
		if (!this.isSoundsOn) return;
		const soundThing = this.sounds[soundName];
		if (!soundThing) {
			if (options.warnMissing) console.warn('No sound found for', soundName);
			return;
		}
		if (options.delay) {
			await SoundController.wait(options.delay);
		}
		if (options.random) { // Random chance that the sound doesn't play
			// 1 = always play, 0 = never play, 0.5 = half chance of playing
			if (Random.chance(options.random)) return;
		}
		this.playThing(soundThing, soundName);
	}

	playMusic(soundName, options = {}) {
		if (!this.isMusicOn) return null;
		const soundThing = this.music[soundName];
		if (!soundThing) {
			console.warn('No music found for', soundName);
			return null;
		}
		try {
			this.stopMusic();
		} catch (err) {
			console.warn(err);
		}
		const { loop = true, volume = 0.75 } = options;
		const howlOptions = { ...options, loop, volume };
		this.musicNowPlaying = this.playThing(soundThing, soundName, howlOptions);
		return this.musicNowPlaying;
	}

	playAmbience(soundName, options = {}) {
		if (!this.isSoundsOn) return null;
		const soundThing = this.music[soundName];
		if (!soundThing) {
			console.warn('No music found for', soundName);
			return null;
		}
		try {
			this.stopAmbience();
		} catch (err) {
			console.warn(err);
		}
		const { loop = true } = options;
		const howlOptions = { ...options, loop };
		this.ambienceNowPlaying = this.playThing(soundThing, soundName, howlOptions);
		return this.ambienceNowPlaying;
	}

	/** WIP */
	playList(soundNames = [], options = {}, individualOptions = []) {
		const getOptions = (i) => {
			let opt = { ...options };
			if (typeof individualOptions[i] === 'object') {
				opt = { ...opt, ...individualOptions[i] };
			}
			return opt;
		};
		this.playlist = soundNames.map((soundName, i) => ({
			soundName,
			options: getOptions(i),
		}));
		this.playlistIndex = 0;
		return this.playNext(0);
	}

	playNext(i) {
		this.playlistIndex = (typeof i === 'number') ? i : this.playlistIndex + 1;
		this.playlistIndex %= this.playlist.length;
		const { soundName, options } = this.playlist[this.playlistIndex];
		return this.playMusic(soundName, options);
	}
}

SoundController.Howl = Howl;
SoundController.Howler = Howler;

export default SoundController;
