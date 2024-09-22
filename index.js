const { Atem } = require('atem-connection');
const { Chip, Line } = require("node-libgpiod");

process.on('SIGINT', cleanUp);

let audios = [];
const myAtem = new Atem();

// const atemIP = '10.1.34.34';
const atemIP = '192.168.13.37';


const chip = new Chip(0);

const lines = [
  // left
  new Line(chip, 17), // GPIO 17, aka pin 11, 6th from top (usb headers at the bottom)
  new Line(chip, 27), // 7th from the top
  new Line(chip, 22), // 8th from the top
  new Line(chip, 5), // 6th from the bottom
  new Line(chip, 6), // 5th from the  bottom
  new Line(chip, 13), // 4th from the bottom
  new Line(chip, 26), // 2nd from the bottom
  // right
  new Line(chip, 23), // 8th from the top
  new Line(chip, 24), // 9th from the top
  new Line(chip, 25), // 11th from the top
  new Line(chip, 12), // 5th from the bottom
  new Line(chip, 16), // 3rd from the bottom
];

for (const line of lines) {
  line.requestOutputMode();
}

(async () => {

  myAtem.on('stateChanged', async (state, pathToChange) => {
    console.log('stateChanged', pathToChange.sort());
    console.log('previewed', [
      state.video.mixEffects[0].previewInput,
    ]);
    console.log('programmed', [
      state.video.mixEffects[0].programInput,
    ]);
    // Note: We only have four...
    // TODO: lines[0].setValue(1);
  });
  myAtem.on('receivedCommand', (command) => {
    console.log('receivedCommand', command);
  });

  await myAtem.connect(atemIP);
})();

async function cleanUp() {
  console.log('');
  console.log('Exiting...');
  audios?.forEach(audio => audio.kill());
  myAtem.disconnect().then();
  console.log('Done!');
  console.log('');
  process.exit();
}
