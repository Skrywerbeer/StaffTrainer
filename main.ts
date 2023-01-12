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
		}
}
initKeyboard();

const stave = document.getElementById("stave") as MusicStave;

//stave.drawMarkers(2, 10, 18);
const arr = [...(function*() {for (let i = 0; i < 21; ++i) yield i})()];
console.log(arr);
stave.drawMarkers(...arr);
