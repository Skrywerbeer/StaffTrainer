class MusicStave extends HTMLElement {
	svg;
	private STAVE_FIRST_LINE_POS = 6;
	private STAVE_LAST_LINE_POS = 14;

	private NUMBER_OF_STAVE_POSITIONS = 21;
	private NUMBER_OF_STAVE_LINES = 5;
	// NOTE: we add 2 to NUMBER_OF_STAVE_POSITIONS to compensate
	// for the padding at the top and bottom;
	private DY = 100/(this.NUMBER_OF_STAVE_POSITIONS + 2);

	staveLines = [];
	clef;
	clefType: ("Treble" | "Bass");
	markers = [];

	private CLEF_MARGIN_HORZ = 1;

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
		console.log(this.getAttribute("clef"));

		this.shadowRoot.append(this.svg);
	}
	connectedCallback():void {
		const clef = this.getAttribute("clef");
		if (clef === "treble") {
			this.drawClef("Treble");
			this.clefType = "Treble";
		}
		else if (clef === "bass") {
			this.drawClef("Bass");
			this.clefType = "Bass";
		}
		else {
			throw new Error(`Unsupported clef: "${clef}. defaulting to treble."`);
		}
	}

	initSVG() {
		this.svg = document.createElementNS("http://www.w3.org/2000/svg",
											"svg");
		this.svg.setAttribute("viewBox",
							  `0 0 100 ${this.NUMBER_OF_STAVE_POSITIONS + 2}`);
		this.svg.setAttribute("preserveAspectRatio", "none");
		this.svg.setAttribute("width", "100%");
		this.svg.setAttribute("height", "100%");

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
		line.setAttribute("stroke-width", "2%");
		line.setAttribute("vector-effect", "non-scaling-stroke");
		this.svg.appendChild(line);
		return line;
	}

	drawStaveLines(): void {
		const x0 = 0;
		const x1 = 100;
		// // Ledger lines and the spaces in between.
		const y0 = this.STAVE_FIRST_LINE_POS + 1;
		//const NUMBER_OF_STAVE_LINES = 21;
		for (let i = 0; i < this.NUMBER_OF_STAVE_LINES; ++i) {
			const y = y0 + 2*i;
			const line = this.drawLine(x0, y, x1, y);
			line.setAttribute("class", "staveLine")
			line.setAttribute("part", "staveLine");
			this.staveLines.push(line);
		}
	}

	drawClef(type: "Treble" | "Bass"): void {
		const clef = document.createElementNS("http://www.w3.org/2000/svg",
											  "image");
		let MAGIC_height;
		let MAGIC_y;
		if (type === "Treble") {
			clef.setAttribute("href", "./trebleClef.svg");
			MAGIC_height = 14.5;
			MAGIC_y = 4;
		}
		else if (type === "Bass") {
			clef.setAttribute("href", "./bassClef.svg");
			MAGIC_height = 7.22;
			MAGIC_y = 7;
		}
		clef.setAttribute("preserveAspectRatio", "xMinYMin");
		clef.setAttribute("height", `${MAGIC_height}`);
		clef.setAttribute("x", `${this.CLEF_MARGIN_HORZ}`);
		clef.setAttribute("y", `${MAGIC_y}`);
		this.clef = clef;
		this.svg.append(clef);
	}

	private stavePositionToY(position: number): number {
		return position + 1;
	}
	private positionOnLedgerLine(position: number): boolean {
		const isEven = ((position % 2) === 0);
		if ((position < this.STAVE_FIRST_LINE_POS) && isEven)
			return true;
		else if ((position > this.STAVE_LAST_LINE_POS ) && isEven)
			return true;
		else
			return false;
	}

	drawMarkers(...positions) {
		if (positions.length === 0)
			return;
		const clefBox = this.clef.getBBox();
		const clefTotalWidth = 2*this.CLEF_MARGIN_HORZ + clefBox.width;
		const x0 = clefTotalWidth + clefBox.x;
		const dx = (100 - clefTotalWidth)/(positions.length + 1);
		// TODO: add text element with note letter.
		for (let i = 0; i < positions.length; ++i) {
			const marker = document.createElementNS("http://www.w3.org/2000/svg",
													"circle");
			const y = positions[i] + 1;
			marker.setAttribute("r", `${Math.min(this.DY/3, 1)}`);
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
		if (!this.positionOnLedgerLine(position))
			return marker;

		const box = marker.getBBox();
		const LEDGER_LINE_EXT_LEN = box.width*0.5;
		const x0 = box.x - LEDGER_LINE_EXT_LEN;
		const x1 = box.x + box.width + LEDGER_LINE_EXT_LEN;
		const y = position + 1;
		let lines = [];
		const incrementSign = (position > this.STAVE_LAST_LINE_POS ? -1 : 1);
		for (let i = 0; (position < this.STAVE_FIRST_LINE_POS) ||
			(position > this.STAVE_LAST_LINE_POS); ++i) {
			const line = this.drawLine(x0, position + 1, x1, position + 1);
			line.setAttribute("class", "ledgerLine");
			line.setAttribute("part", "ledgerLine");
			lines.push(line);
			position += 2*incrementSign;
		}
		//const parent = marker.parentElement;
		marker.remove()
		const group = this.groupGrapics(...lines, marker);
		//parent.append(group);
		this.svg.append(group);
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
