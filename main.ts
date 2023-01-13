function* letterRange(start: string="C", end: string="B") {
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

function* noteRange(octave: number, start: string="C", end: string="B") {
	const letters = [...letterRange(start, end)];
	for (const letter of letters)
		yield `${letter}${octave}`;
}

function randomArrayElement(array: any): any {
	return array[Math.round(Math.random()*(array.length-1))];
}

function* TrebleNoteGen(n: number = -1) {
	const TREBLE_NOTES = [
		...noteRange(3, "F"),
		...noteRange(4),
		...noteRange(5),
		...noteRange(6, "C", "E")
	];
	for (let i = 0; i < n; ++i)
		yield randomArrayElement(TREBLE_NOTES);
}

// const PITCH_CLASSES = [
	// 	"C / B♭", "C♯ / D♭", "D", "D♯ / E♭", "F / E♯",
	// 	"F♯ / G♭", "G", "G♯ / A♭", "A", "A♯ / B♭", "B / C♭"
	// ];
const PITCH_CLASSES = ["A", "B", "C", "D", "E", "F", "G"];

const KEYBOARD = document.getElementById("keyboard");
function initKeyboard() {
		//	KEYBOARD.setAttribute("width", String(SVG_WIDTH));
		let keys = [];
		for (let i = 0; i < PITCH_CLASSES.length; ++i) {
			const newKey = document.createElement("button");
			newKey.textContent = PITCH_CLASSES[i];
			KEYBOARD.append(newKey);
			newKey.addEventListener("click", clickHandler);
		}
}
initKeyboard();

const stave = document.getElementById("stave") as MusicStave;

const NUMBER_OF_NOTES = 4;
let notes = [];
let noteIndex = 0;

function newGame() {
	notes = [...TrebleNoteGen(NUMBER_OF_NOTES)];
	console.log(`New notes: ${notes}`);
	noteIndex = 0;
	stave.addNotes(notes);
}

function clickHandler(event) {
	const letter = event.target.textContent;
	if (letter === notes[noteIndex].charAt(0)) {
		const marker = stave.markerGroups.shift();
		marker.remove();
		noteIndex++;
	}
	
	if (noteIndex === NUMBER_OF_NOTES) {
		newGame();
	}
}
newGame();
// const TREBLE_NOTES = [
// 	...noteRange(3, "F"),
// 	...noteRange(4),
// 	...noteRange(5),
// 	...noteRange(6, "C", "E")
// ];
//stave.addNotes(TREBLE_NOTES);
//stave.addNotes(["C4","D4"]);
