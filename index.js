const { Atem } = require('atem-connection');
const { Chip, Line, available } = require("node-libgpiod");

process.on('SIGINT', cleanUp);

console.log('Initializing...');

let lines;
const atem = new Atem();

// const atemIP = '10.1.34.34';
// const atemIP = '192.168.13.37';
const atemIP = '192.168.1.47';

(() => {
  if (!available()) {
    console.error("gpio is not available on this machine! did you follow the README?");
    process.exit(1);
  }
  const chip = new Chip(0);
  const atemLineMap = {
    // physical pins start at the top left, pins toward you, with the USB ports pointed downward, on the 3b
    1: [ // main, tally 1
      new Line(chip, 22 /* gpio */), // physical pin 15
      new Line(chip, 23) // pin 16
    ],
    9: [ // tripod, tally 9
      new Line(chip, 6), // 31
      new Line(chip, 12) // 32
    ],
    10: [ // flycam, tally 10
      new Line(chip, 19), // 35
      new Line(chip, 16) // 36
    ],
    11: [ // handheld, tally 11
      new Line(chip, 20), // 37
      new Line(chip, 26) // 39
    ],
  };
  const mappedInputs = Object.keys(atemLineMap).map(l => parseInt(l, 10));

  console.log('Requesting output mode on all lines...');
  const lines = Object.values(atemLineMap).flat(1);
  for (const line of lines) {
    line.requestOutputMode();
  }

  atem.on('stateChanged', (state, pathToChange) => {
    const previewed = state.video.mixEffects.map(me => me.previewInput);
    const programmed = state.video.mixEffects.map(me => me.programInput);
    console.log('previewed: ' + previewed.join(', '));
    console.log('programmed: ' + programmed.join(', '));
    for (const mappedInput of mappedInputs) {
      const lines = atemLineMap[mappedInput];
      console.log(lines[0].getLineOffset());
      lines[0].setValue(previewed.includes(mappedInput) ? 1 : 0);
      console.log(lines[0].getLineOffset());
      lines[1].setValue(programmed.includes(mappedInput) ? 1 : 0);
    }
  });

  atem.connect(atemIP)
    .then(() => {
      console.log('Connected. Probably.');
    })
    .catch(err => {
      console.error(err);
    });
})();

function cleanUp() {
  console.log('');
  console.log('Exiting...');
  if (lines) {
    for (const line of lines) {
      line.release();
    }
  }
  atem.disconnect().catch(e => console.error(e));
  console.log('Done!');
  console.log('');
  process.exit();
}
