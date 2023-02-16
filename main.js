function* letterRange(start = "C", end = "B") {
    const LETTERS = ["C", "D", "E", "F", "G", "A", "B"];
    let i = LETTERS.indexOf(start.toUpperCase());
    if (i === -1)
        throw new Error("Invalid starting letter (${start}).");
    const endIndex = LETTERS.indexOf(end.toUpperCase());
    if (endIndex === -1)
        throw new Error("Invalid ending letter (${end}).");
    for (; i <= endIndex; ++i)
        yield LETTERS[i];
}
function* noteRange(octave, start = "C", end = "B") {
    const letters = [...letterRange(start, end)];
    for (const letter of letters)
        yield `${letter}${octave}`;
}
function randomArrayElement(array) {
    return array[Math.round(Math.random() * (array.length - 1))];
}
function* FrequencyLUT() {
    const NUMBER_OF_OCTAVES = 6;
    const FIRST_OCTAVE = 1;
    const INTERVALS = [0, 2, 4, 5, 7, 9, 10];
    const C0_FREQ = 16.35159 * 4;
    for (let i = FIRST_OCTAVE; i < NUMBER_OF_OCTAVES + FIRST_OCTAVE; ++i) {
        const notes = [...noteRange(i)];
        for (let j = 0; j < notes.length; ++j)
            yield { note: notes[j],
                frequency: C0_FREQ * Math.pow(2, (12 * i + INTERVALS[j]) / 12) };
    }
}
let LUT = new Map();
for (const entry of [...FrequencyLUT()])
    LUT.set(entry.note, entry.frequency);
function* TrebleNoteGen(n = -1) {
    const TREBLE_NOTES = [
        ...noteRange(3, "F"),
        ...noteRange(4),
        ...noteRange(5),
        ...noteRange(6, "C", "E")
    ];
    for (let i = 0; i < n; ++i)
        yield randomArrayElement(TREBLE_NOTES);
}
function* BassNoteGen(n = -1) {
    const BASS_NOTES = [
        ...noteRange(1, "A"),
        ...noteRange(2),
        ...noteRange(3),
        ...noteRange(4, "C", "G")
    ];
    for (let i = 0; i < n; ++i)
        yield randomArrayElement(BASS_NOTES);
}
const PITCH_CLASSES = ["A", "B", "C", "D", "E", "F", "G"];
const KEYBOARD = document.getElementById("keyboard");
function initKeyboard() {
    let keys = [];
    for (let i = 0; i < PITCH_CLASSES.length; ++i) {
        const newKey = document.createElement("button");
        newKey.textContent = PITCH_CLASSES[i];
        KEYBOARD.append(newKey);
        newKey.addEventListener("click", clickHandler);
    }
}
initKeyboard();
const stave = document.getElementById("stave");
const NUMBER_OF_NOTES = 4;
let notes = [];
let noteIndex = 0;
function newGame() {
    const dice = Math.random();
    if (dice < 0.5) {
        stave.setAttribute("clef", "treble");
        notes = [...TrebleNoteGen(NUMBER_OF_NOTES)];
    }
    else {
        stave.setAttribute("clef", "bass");
        notes = [...BassNoteGen(NUMBER_OF_NOTES)];
    }
    console.log(`New notes: ${notes}`);
    noteIndex = 0;
    stave.addNotes(notes);
}
const audioCtx = new AudioContext();
function clickHandler(event) {
    const letter = event.target.textContent;
    if (letter === notes[noteIndex].charAt(0)) {
        stave.popNote();
        if (audioCtx.state === "suspended")
            audioCtx.resume();
        const TONE_LENGTH = 0.3;
        const gain = audioCtx.createGain();
        gain.connect(audioCtx.destination);
        gain.gain.value = 1;
        gain.gain.setTargetAtTime(0, audioCtx.currentTime, TONE_LENGTH / 2);
        const osc = new OscillatorNode(audioCtx, {
            type: "sine",
            frequency: LUT.get(notes[noteIndex])
        });
        osc.connect(gain);
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + TONE_LENGTH);
        noteIndex++;
    }
    if (noteIndex === NUMBER_OF_NOTES) {
        newGame();
    }
}
newGame();
