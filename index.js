const { Atem } = require('atem-connection');
const { Chip, Line, available } = require('node-libgpiod');

process.on('SIGINT', cleanUp);

console.log('Initializing...');

const atem = new Atem();

// const atemIP = '10.1.34.34';
// const atemIP = '192.168.13.37';
const atemIP = '192.168.1.47';

if (!available()) {
  console.error('gpio is not available on this machine! did you follow the README?');
  process.exit(1);
}
const chip = new Chip(0);
const lines = [
  // physical pins start at the top left, pins toward you, with the USB ports pointed downward, on the 3b
  {
    // main
    input: 1,
    preview: new Line(chip, 22 /* gpio */), // physical pin 15
    program: new Line(chip, 23), // pin 16
  },
  // tripod
  {
    input: 9,
    preview: new Line(chip, 6), // 31
    program: new Line(chip, 12), // 32
  },
  // flycam
  {
    input: 10,
    preview: new Line(chip, 19), // 35
    program: new Line(chip, 16), // 36
  },
  // handheld
  {
    input: 11,
    preview: new Line(chip, 20), // 37
    program: new Line(chip, 26), // 39
  },
];

console.log('Requesting output mode on all linePairs...');
for (const line of lines) {
  line.preview.requestOutputMode();
  line.program.requestOutputMode();
}

atem.on('stateChanged', (state, pathToChange) => {
  const previewed = state.video.mixEffects.map(me => me.previewInput);
  const programmed = state.video.mixEffects.map(me => me.programInput);
  for (const line of lines) {
    line.preview.setValue(previewed.includes(line.input) ? 1 : 0);
    line.program.setValue(programmed.includes(line.input) ? 1 : 0);
  }
});

atem.connect(atemIP)
  .then(() => {
    console.log('Connected. Probably.');
  })
  .catch(err => {
    console.error(err);
  });

function cleanUp() {
  console.log('');
  console.log('Exiting...');
  if (lines) {
    for (const line of lines) {
      line.preview.release();
      line.program.release();
    }
  }
  atem.disconnect().catch(e => console.error(e));
  console.log('Done!');
  console.log('');
  process.exit();
}
