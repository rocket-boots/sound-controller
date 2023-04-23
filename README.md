# Sound Controller
***A light library for playing game sounds and music***

```
npm install github:rocket-boots/sound-controller#v0.1.0
```

```javascript
import { SoundController } from 'sound-controller';

// Define sounds and music as key values
const soundsConfig = {
	walk: [
		`audio/sounds/steps-001.wav`,
		`audio/sounds/steps-002.wav`,
		`audio/sounds/steps-003.wav`,
		`audio/sounds/steps-004.wav`,
		`audio/sounds/steps-005.wav`,
	],
	explosion: 'audio/sounds/boom.wav',
};
const musicConfig = {
	entrance: 'audio/music/entrance.mp3',
	boss: 'audio/music/boss_battle_1.wav',
};

// Instantiate a sound controller
const sounds = new SoundController(soundsConfig, musicConfig);

// In your game or app...
sounds.play('explosion');

sounds.playMusic('boss');
```
