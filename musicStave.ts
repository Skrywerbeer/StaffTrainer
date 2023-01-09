class MusicStave extends HTMLElement {
	svg;
	get width() {return this.SVG_WIDTH;}
	private SVG_WIDTH;
	get height() {return this.SVG_HEIGHT;}
	private SVG_HEIGHT;

	private STAVE_WIDTH_RATIO = 0.8;
	private STAVE_HEIGHT_RATIO = 0.90;
	private STAVE_WIDTH;
	private STAVE_HEIGHT;

	private STAVE_FIRST_LINE_POS = 6;
	private STAVE_LAST_LINE_POS = 14;

	private NUMBER_OF_STAVE_POSITIONS = 21;
	private NUMBER_OF_STAVE_LINES = 5;
	// TODO: compensate for stroke width;
	private DY;

	private STAVE_MARGIN_HORZ_RATIO = 0.1;
	//const STAVE_MARGIN_VERT_RATIO = 0.05;
	private STAVE_MARGIN_HORZ;
	private STAVE_MARGIN_VERT;

	staveLines = [];
	clef;
	markers = [];

	private CLEF_MARGIN_HORZ;

	// const PITCH_CLASSES = [
	// 	"C / B♭", "C♯ / D♭", "D", "D♯ / E♭", "F / E♯",
	// 	"F♯ / G♭", "G", "G♯ / A♭", "A", "A♯ / B♭", "B / C♭"
	// ];
	PITCH_CLASSES = ["A", "B", "C", "D", "E", "F", "G"];

	constructor() {
		super();
		this.attachShadow({mode: "open"});

		this.initSVG();
		// TODO: read attributes from html.
		this.drawStaveLines();

		this.shadowRoot.append(this.svg);
		if (this.attributes["clef"]) {
			if (this.attributes["clef"] === "treble")
				this.drawTrebleClef();
			else if (this.attributes["clef"] === "bass")
				this.drawBassClef();

		}
		else {
			this.drawTrebleClef();
		}
	}

	initSVG() {
		this.svg = document.createElementNS("http://www.w3.org/2000/svg",
											"svg");
		this.resizeSVG();
	}
	updateSizeInfo() {
		this.SVG_WIDTH = document.body.clientWidth*0.6;
		this.SVG_HEIGHT = this.SVG_WIDTH*0.3;
		this.STAVE_WIDTH = this.SVG_WIDTH*this.STAVE_WIDTH_RATIO;
		this.STAVE_HEIGHT = this.SVG_HEIGHT*this.STAVE_HEIGHT_RATIO;
		this.DY = this.STAVE_HEIGHT/this.NUMBER_OF_STAVE_POSITIONS;
		this.STAVE_MARGIN_HORZ = this.SVG_WIDTH*this.STAVE_MARGIN_HORZ_RATIO;
		this.STAVE_MARGIN_VERT = this.DY;
		this.CLEF_MARGIN_HORZ = this.STAVE_WIDTH*0.01;
	}
	resizeSVG() {
		this.updateSizeInfo();
		this.svg.setAttribute("viewBox",
							  `0 0 ${this.SVG_WIDTH} ${this.SVG_HEIGHT}`);
		this.svg.setAttribute("width", `${this.SVG_WIDTH}`);
		this.svg.setAttribute("height", `${this.SVG_HEIGHT}`);
	}

	drawLine(x1: number, y1: number,
					  x2: number, y2: number,
					  stroke: string="black"): SVGPolylineElement {
		// NOTE: use a polyline to save on four .setAttribute calls.
		const line = document.createElementNS("http://www.w3.org/2000/svg",
											  "polyline");
		line.setAttribute("points", `${x1} ${y1}, ${x2} ${y2}`);
		line.setAttribute("fill", "none");
		line.setAttribute("stroke", `${stroke}`);
		this.svg.appendChild(line);
		return line;
	}

	drawStaveLines(): void {
		const x0 = this.STAVE_MARGIN_HORZ;
		const x1 = this.STAVE_MARGIN_HORZ + this.STAVE_WIDTH;
		// // Ledger lines and the spaces in between.
		const y0 = this.STAVE_MARGIN_VERT + this.STAVE_FIRST_LINE_POS*this.DY;
		//const y0 = STAVE_MARGIN_VERT;

		//const NUMBER_OF_STAVE_LINES = 21;
		for (let i = 0; i < this.NUMBER_OF_STAVE_LINES; ++i) {
			const y = y0+2*this.DY*i;
			const line = this.drawLine(x0, y, x1, y);
			line.setAttribute("class", "staveLine")
			line.setAttribute("part", "staveLine");
			this.staveLines.push(line);
		}
	}
	resizeStave() {
		const x0 = this.STAVE_MARGIN_HORZ;
		const x1 = this.STAVE_MARGIN_HORZ + this.STAVE_WIDTH;
		// // Ledger lines and the spaces in between.
		const y0 = this.STAVE_MARGIN_VERT + this.STAVE_FIRST_LINE_POS*this.DY;
		for (let i = 0; i < this.staveLines.length; ++i) {
			const y = y0+2*this.DY*i;
			this.staveLines[i].setAttribute("points",
											`${x0} ${y}, ${x1}, ${y}`);
		}
	}

	drawTrebleClef(): void {
		const x = this.STAVE_MARGIN_HORZ + this.CLEF_MARGIN_HORZ;
		const POSITIONS_TO_BASELINE = 14;

		const clef = document.createElementNS("http://www.w3.org/2000/svg",
											  "text");
		clef.textContent = "𝄞";
		// MAGIC_RATIO is the ratio of the distance between the clef's baseline,
		// which sits on the last stave line, to the second stave line in px
		// to the clef's font size in px.
		const MAGIC_RATIO = 0.2497;
		const SIZE = (2*this.DY)/(MAGIC_RATIO);
		clef.style.fontSize = `${SIZE}px`;
		const y = this.STAVE_MARGIN_VERT + POSITIONS_TO_BASELINE*this.DY;
		clef.setAttribute("x", `${x}`);
		clef.setAttribute("y", `${y}`);
		this.clef = clef
		this.svg.append(clef);
	}

	drawBassClef(): void {
		const x = this.STAVE_MARGIN_HORZ + this.CLEF_MARGIN_HORZ;
		const POSITIONS_TO_BASELINE = 14;
		const clef = document.createElementNS("http://www.w3.org/2000/svg",
											  "text");
		clef.textContent = "𝄢";
		// In the case of the bass clef MAGIC_RATIO is
		// the ratio of the distance between the clef's two
		// dot's centers to the clef's font size.
		// The two dots stradle the F line thus 2*this.DY.
		const MAGIC_RATIO = 0.2200;
		const SIZE = (2*this.DY)/(MAGIC_RATIO);
		clef.style.fontSize = `${SIZE}px`;
		const y = this.STAVE_MARGIN_VERT + POSITIONS_TO_BASELINE*this.DY;
		clef.setAttribute("x", `${x}`);
		clef.setAttribute("y", `${y}`);
		this.clef = clef;
		this.svg.append(clef);
	}

	

	private stavePositionToY(position: number): number {
		return this.STAVE_MARGIN_VERT + position*this.DY;
	}

	drawMarkers(...positions) {
		if (positions.length === 0)
			return;
		const clefTotalWidth = 2*this.CLEF_MARGIN_HORZ +
			this.clef.getBBox().width;
		const x0 = this.STAVE_MARGIN_HORZ + clefTotalWidth;
		const dx = (this.STAVE_WIDTH - clefTotalWidth)/(positions.length + 1);
		for (let i = 0; i < positions.length; ++i) {
			const marker = document.createElementNS("http://www.w3.org/2000/svg",
													"circle");
			const y = this.stavePositionToY(positions[i]);
			marker.setAttribute("r", "8");
			marker.setAttribute("cx", `${x0 + dx*(i+1)}`);
			marker.setAttribute("cy", `${y}`);
			marker.setAttribute("class", "marker");
			marker.setAttribute("part", "marker");
			this.svg.append(marker);
			// TODO: move to a seperate iteration over markers
			// in seperate iteration add accidental decorators.
			this.markers.push(this.addLedgerLine(marker, positions[i]));
		}
	}

	private addLedgerLine(marker: SVGGraphicsElement,
						   position: number): SVGGElement {
		// NOTE: marker needs to be added to an <svg> to have coordinates.[O]
		if (((position <= this.STAVE_FIRST_LINE_POS) ||
			(position >= this.STAVE_LAST_LINE_POS)) && (position % 2) === 1)
			return marker;
		const box = marker.getBBox();
		const LEDGER_LINE_EXT_LEN = box.width/2;
		const x0 = box.x - LEDGER_LINE_EXT_LEN;
		const x1 = box.x + box.width + LEDGER_LINE_EXT_LEN;
		const y = box.y + box.width/2;
		let lines = [];
		// pos < STAVE_FIRSTLINE ||
		//     STAVE_LAST_LINE_POS < pos < NUMBER_OF_STAVE_POSITIONS
		const incrementSign = (position > this.STAVE_LAST_LINE_POS ? -1 : 1);
		for (let i = 0; (position < this.STAVE_FIRST_LINE_POS) ||
			(position > this.STAVE_LAST_LINE_POS); ++i) {
			const dy = 2*i*this.DY*incrementSign;
			const line = this.drawLine(x0, y + dy, x1, y + dy);
			line.setAttribute("class", "ledgerLine");
			line.setAttribute("part", "ledgerLine");
			lines.push(line);
			position += 2*incrementSign;
		}
		const parent = marker.parentElement;
		marker.remove()
		const group = this.groupGrapics(...lines, marker);
		parent.append(group);
		return group
	}

	private groupGrapics(...graphics): SVGGElement {
		const group = document.createElementNS("http://www.w3.org/2000/svg",
											   "g");
		group.append(...graphics);
		return group;
	}
}
customElements.define("music-stave", MusicStave);
