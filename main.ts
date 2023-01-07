const SVG = (document.getElementById("output") as unknown) as SVGElement;
const SVG_WIDTH = document.body.clientWidth*0.6;
const SVG_HEIGHT = SVG_WIDTH*0.3;

const STAVE_WIDTH_RATIO = 0.8;
const STAVE_HEIGHT_RATIO = 0.90;
const STAVE_WIDTH = SVG_WIDTH*STAVE_WIDTH_RATIO;
const STAVE_HEIGHT = SVG_HEIGHT*STAVE_HEIGHT_RATIO;

const STAVE_FIRST_LINE_POS = 6;
const STAVE_LAST_LINE_POS = 14;

const NUMBER_OF_STAVE_POSITIONS = 21;
// TODO: compensate for stroke width;
const DY = STAVE_HEIGHT/NUMBER_OF_STAVE_POSITIONS;

const STAVE_MARGIN_HORZ_RATIO = 0.1;
//const STAVE_MARGIN_VERT_RATIO = 0.05;
const STAVE_MARGIN_HORZ = SVG_WIDTH*STAVE_MARGIN_HORZ_RATIO;
//const STAVE_MARGIN_VERT = SVG_HEIGHT*STAVE_MARGIN_VERT_RATIO;
const STAVE_MARGIN_VERT = DY;

let STAVE_LINES = [];
let CLEF;
let MARKERS = [];

const CLEF_MARGIN_HORZ = STAVE_WIDTH*0.01;

const KEYBOARD = document.getElementById("keyboard");

// const PITCH_CLASSES = [
// 	"C / B♭", "C♯ / D♭", "D", "D♯ / E♭", "F / E♯",
// 	"F♯ / G♭", "G", "G♯ / A♭", "A", "A♯ / B♭", "B / C♭"
// ];
const PITCH_CLASSES = ["A", "B", "C", "D", "E", "F", "G"];

function initSVG() {
	SVG.setAttribute("viewBox", `0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`);
	SVG.setAttribute("width", `${SVG_WIDTH}`);
	SVG.setAttribute("height", `${SVG_HEIGHT}`);

}

function drawLine(x1: number, y1: number,
				  x2: number, y2: number,
				  stroke: string="black"): SVGPolylineElement {
	// NOTE: use a polyline to save on four .setAttribute calls.
	const line = document.createElementNS("http://www.w3.org/2000/svg",
											  "polyline");
	line.setAttribute("points", `${x1} ${y1}, ${x2} ${y2}`);
	line.setAttribute("fill", "none");
	line.setAttribute("stroke", `${stroke}`);
	SVG.appendChild(line);
	return line;
}

function drawStaveLines(): void {
	const x0 = STAVE_MARGIN_HORZ;
	const x1 = STAVE_MARGIN_HORZ + STAVE_WIDTH;
	// // Ledger lines and the spaces in between.
	const y0 = STAVE_MARGIN_VERT + STAVE_FIRST_LINE_POS*DY;
	//const y0 = STAVE_MARGIN_VERT;
	const NUMBER_OF_STAVE_LINES = 5;
	//const NUMBER_OF_STAVE_LINES = 21;
	for (let i = 0; i < NUMBER_OF_STAVE_LINES; ++i)
		STAVE_LINES.push(drawLine(x0, y0+2*DY*i, x1, y0+2*DY*i));
	STAVE_LINES.forEach((line) => {line.setAttribute("class", "staveLine")});
}

function drawTrebleClef(): void {
	const x = STAVE_MARGIN_HORZ + CLEF_MARGIN_HORZ;
	const POSITIONS_TO_BASELINE = 14;

	const clef = document.createElementNS("http://www.w3.org/2000/svg",
										  "text");
	clef.textContent = "𝄞";
	// MAGIC_RATIO is the ratio of the distance between the clef's baseline,
	// which sits on the last stave line, to the second stave line in px
	// to the clef's font size in px.
	const MAGIC_RATIO = 0.2497;
	const SIZE = (2*DY)/(MAGIC_RATIO);
	clef.style.fontSize = `${SIZE}px`;
	const y = STAVE_MARGIN_VERT + POSITIONS_TO_BASELINE*DY;
	clef.setAttribute("x", `${x}`);
	clef.setAttribute("y", `${y}`);
	CLEF = clef
	SVG.append(clef);
}

function drawBassClef(): void {
	const x = STAVE_MARGIN_HORZ + CLEF_MARGIN_HORZ;
	const POSITIONS_TO_BASELINE = 14;
	const clef = document.createElementNS("http://www.w3.org/2000/svg",
										  "text");
	clef.textContent = "𝄢";
	// In the case of the bass clef MAGIC_RATIO is
	// the ratio of the distance between the clef's two
	// dot's centers to the clef's font size.
	// The two dots stradle the F line thus 2*DY.
	const MAGIC_RATIO = 0.2200;
	const SIZE = (2*DY)/(MAGIC_RATIO);
	clef.style.fontSize = `${SIZE}px`;
	const y = STAVE_MARGIN_VERT + POSITIONS_TO_BASELINE*DY;
	clef.setAttribute("x", `${x}`);
	clef.setAttribute("y", `${y}`);
	SVG.append(clef);
}

function initKeyboard() {
//	KEYBOARD.setAttribute("width", String(SVG_WIDTH));
	let keys = [];
	for (let i = 0; i < PITCH_CLASSES.length; ++i) {
		const newKey = document.createElement("button");
		newKey.textContent = PITCH_CLASSES[i];
		KEYBOARD.append(newKey);
	}
}

function stavePositionToY(position: number): number {
	return STAVE_MARGIN_VERT + position*DY;
}

function drawMarkers(...positions) {
	if (positions.length === 0)
		return;
	const clefTotalWidth = 2*CLEF_MARGIN_HORZ + CLEF.getBBox().width;
	const x0 = STAVE_MARGIN_HORZ + clefTotalWidth;
	const dx = (STAVE_WIDTH - clefTotalWidth)/(positions.length + 1);
	for (let i = 0; i < positions.length; ++i) {
		const marker = document.createElementNS("http://www.w3.org/2000/svg",
												"circle");
		const y = stavePositionToY(positions[i]);
		marker.setAttribute("r", "8");
		marker.setAttribute("cx", `${x0 + dx*(i+1)}`);
		marker.setAttribute("cy", `${y}`);
		marker.setAttribute("class", "marker");
		SVG.append(marker);
		// TODO: move to a seperate iteration over MARKERS
		// in seperate iteration add accidental decorators.
		MARKERS.push(addLedgerLine(marker, positions[i]));
	}
}

function addLedgerLine(marker: SVGGraphicsElement,
					   position: number): SVGGElement {
	// NOTE: marker needs to be added to an <svg> to have coordinates.[O]
	if (((position <= STAVE_FIRST_LINE_POS) ||
		(position >= STAVE_LAST_LINE_POS)) && (position % 2) === 1)
		return marker;
	const box = marker.getBBox();
	const LEDGER_LINE_EXT_LEN = box.width/2;
	const x0 = box.x - LEDGER_LINE_EXT_LEN;
	const x1 = box.x + box.width + LEDGER_LINE_EXT_LEN;
	const y = box.y + box.width/2;
	let lines = [];
	// pos < STAVE_FIRSTLINE ||
	//     STAVE_LAST_LINE_POS < pos < NUMBER_OF_STAVE_POSITIONS
	const incrementSign = (position > STAVE_LAST_LINE_POS ? -1 : 1);
	for (let i = 0; (position < STAVE_FIRST_LINE_POS) ||
		(position > STAVE_LAST_LINE_POS); ++i) {
		const dy = 2*i*DY*incrementSign;
		const line = drawLine(x0, y + dy, x1, y + dy);
		line.setAttribute("class", "ledgerLine");
		lines.push(line);
		position += 2*incrementSign;
	}
	const parent = marker.parentElement;
	marker.remove()
	const group = groupGrapics(...lines, marker);
	parent.append(group);
	return group
}

function groupGrapics(...graphics): SVGGElement {
	const group = document.createElementNS("http://www.w3.org/2000/svg",
										   "g");
	group.append(...graphics);
	return group;
}

initSVG();
drawStaveLines();

drawTrebleClef();

drawMarkers(2, 10, 18, 10, 2);

//drawBassClef();
initKeyboard();
