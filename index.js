const { Atem } = require('atem-connection');
const rpio = require('rpio');

process.on('SIGINT', cleanUp);

console.log('Initializing...');

const atem = new Atem();

// const atemIP = '10.1.34.34';
// const atemIP = '192.168.13.37';
const atemIP = '192.168.1.47';

const lines = [
  // physical pins start at the top left, pins toward you, with the USB ports pointed downward, on the 3b
  {
    // main
    input: 1,
    preview: 15,
    program: 16,
  },
  // tripod
  {
    input: 9,
    preview: 31,
    program: 32,
  },
  // flycam
  {
    input: 10,
    preview: 35,
    program: 36,
  },
  // handheld
  {
    input: 11,
    preview: 37,
    program: 38,
  },
];

console.log('Requesting output mode on all linePairs...');
for (const line of lines) {
  rpio.open(line.preview, rpio.OUTPUT, rpio.LOW);
  rpio.open(line.program, rpio.OUTPUT, rpio.LOW);
}
let previewed = [];
let programmed = [];

atem.on('stateChanged', (state, pathToChange) => {
  previewed = state.video.mixEffects.map(me => me.previewInput);
  programmed = state.video.mixEffects.map(me => me.programInput);
  setTimeout(updateState, 1);
});

function updateState() {
  for (const line of lines) {
    rpio.write(line.preview, previewed.includes(line.input) ? rpio.HIGH : rpio.LOW);
    rpio.write(line.program, programmed.includes(line.input) ? rpio.HIGH : rpio.LOW);
  }
}

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
  atem.disconnect().catch(e => console.error(e));
  console.log('Done!');
  console.log('');
  process.exit();
}
