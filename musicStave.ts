class MusicStave extends HTMLElement {
	svg;
	private STAVE_FIRST_LINE_POS = 6;
	private STAVE_LAST_LINE_POS = 14;

	private NUMBER_OF_STAVE_POSITIONS = 21;
	private NUMBER_OF_STAVE_LINES = 5;
	// NOTE: we add 2 to NUMBER_OF_STAVE_POSITIONS to compensate
	// for the padding at the top and bottom;

	staveLines = [];
	clef;
	clefType: ("Treble" | "Bass");
	markerGroups = [];

	private CLEF_MARGIN_HORZ = 1;

	// const PITCH_CLASSES = [
	// 	"C / B♭", "C♯ / D♭", "D", "D♯ / E♭", "F / E♯",
	// 	"F♯ / G♭", "G", "G♯ / A♭", "A", "A♯ / B♭", "B / C♭"
	// ];
	PITCH_CLASSES = ["A", "B", "C", "D", "E", "F", "G"];

	addNotes(notes) {
		let positions = [];
		notes.forEach((note) => {positions.push(this.noteToPosition(note));});
		this.drawMarkers(positions);
	}

	constructor() {
		super();
		this.attachShadow({mode: "open"});
		this.initSVG();
		this.drawStaveLines();
		this.shadowRoot.append(this.svg);
	}
	private connectedCallback():void {
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

	private initSVG() {
		this.svg = document.createElementNS("http://www.w3.org/2000/svg",
											"svg");
		this.svg.setAttribute("viewBox",
							  `0 -2 100 ${this.NUMBER_OF_STAVE_POSITIONS + 4}`);
		this.svg.setAttribute("preserveAspectRatio", "none");
		this.svg.setAttribute("width", "100%");
		this.svg.setAttribute("height", "100%");

	}

	private drawLine(x1: number, y1: number,
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

	private drawStaveLines(): void {
		const x0 = 0;
		const x1 = 100;
		// // Ledger lines and the spaces in between.
		const y0 = this.STAVE_FIRST_LINE_POS;
		//const NUMBER_OF_STAVE_LINES = 21;
		for (let i = 0; i < this.NUMBER_OF_STAVE_LINES; ++i) {
			const y = y0 + 2*i;
			const line = this.drawLine(x0, y, x1, y);
			line.setAttribute("class", "staveLine")
			line.setAttribute("part", "staveLine");
			this.staveLines.push(line);
		}
	}

	private drawClef(type: "Treble" | "Bass"): void {
		const clef = document.createElementNS("http://www.w3.org/2000/svg",
											  "image");
		let MAGIC_height;
		let MAGIC_y;
		if (type === "Treble") {
			this.clefType = "Treble";
			clef.setAttribute("href", "./trebleClef.svg");
			MAGIC_height = 14.5;
			MAGIC_y = 4;
		}
		else if (type === "Bass") {
			this.clefType = "Bass";
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

	noteToPosition(note: string) {
		switch (this.clefType) {
			case ("Treble"):
				switch (note.toUpperCase()) {
					case ("E6"): return 0;
					case ("D6"): return 1;
					case ("C6"): return 2;
					case ("B5"): return 3;
					case ("A5"): return 4;
					case ("G5"): return 5;
					case ("F5"): return 6;
					case ("E5"): return 7;
					case ("D5"): return 8;
					case ("C5"): return 9;
					case ("B4"): return 10;
					case ("A4"): return 11;
					case ("G4"): return 12;
					case ("F4"): return 13;
					case ("E4"): return 14;
					case ("D4"): return 15;
					case ("C4"): return 16;
					case ("B3"): return 17;
					case ("A3"): return 18;
					case ("G3"): return 19;
					case ("F3"): return 20;
				}
				throw new Error(`Note (${note}) not in treble clef range.`);
			case ("Bass"):
				switch(note.toUpperCase()) {
					case ("G4"): return 0;
					case ("F4"): return 1;
					case ("E4"): return 2;
					case ("D4"): return 3;
					case ("C4"): return 4;
					case ("B3"): return 5;
					case ("A3"): return 6;
					case ("G3"): return 7;
					case ("F3"): return 8;
					case ("E3"): return 9;
					case ("D3"): return 10;
					case ("C2"): return 11;
					case ("B2"): return 12;
					case ("A2"): return 13;
					case ("G2"): return 14;
					case ("F2"): return 15;
					case ("E2"): return 16;
					case ("D2"): return 17;
					case ("C1"): return 18;
					case ("B1"): return 19;
					case ("A1"): return 20;
				}
				throw new Error(`Note (${note}) not in bass clef range.`);
		}
	}
	
	private stavePositionToY(position: number): number {
		return position;
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

	private drawMarkers(positions) {
		if (positions.length === 0)
			return;
		const clefBox = this.clef.getBBox();
		const clefTotalWidth = 2*this.CLEF_MARGIN_HORZ + clefBox.width;
		const x0 = clefTotalWidth + clefBox.x;
		const dx = (100 - clefTotalWidth)/(positions.length + 1);
		// TODO: add text element with note letter.
		for (let i = 0; i < positions.length; ++i) {
			const group = document.createElementNS("http://www.w3.org/2000/svg",
												   "g");
			this.markerGroups.push(group);
			this.svg.append(group);
			const marker = document.createElementNS("http://www.w3.org/2000/svg",
													"circle");
			group.append(marker);
			const y = positions[i];
			marker.setAttribute("r", `2%`);
			marker.setAttribute("cx", `${x0 + dx*(i+1)}`);
			marker.setAttribute("cy", `${y}`);
			marker.setAttribute("class", "marker");
			marker.setAttribute("part", "marker");
			this.addLedgerLines(group);
		}
	}

	private addLedgerLines(group: SVGGElement): SVGGElement {
		// NOTE: we assume the first child is the marker itself.
		const box = (group.children[0] as SVGGraphicsElement).getBBox();
		const LEDGER_LINE_EXT_LEN = box.width*0.5;
		const x0 = box.x - LEDGER_LINE_EXT_LEN;
		const x1 = box.x + box.width + LEDGER_LINE_EXT_LEN;
		let lines = [];
		const incrementSign = (box.y > this.STAVE_LAST_LINE_POS ? -1 : 1);
		let y = Math.round(box.height/2 + box.y);
		if ((y % 2) === 1) {
			if (incrementSign > 0)
				y++;
			else
				y--;
		}
		while ((y < this.STAVE_FIRST_LINE_POS) ||
			(y > this.STAVE_LAST_LINE_POS)) {
			const line = this.drawLine(x0, y, x1, y);
			line.setAttribute("class", "ledgerLine");
			line.setAttribute("part", "ledgerLine");
			lines.push(line);
			y += 2*incrementSign;
		}
		group.append(...lines);
		return group
	}
	// private addLedgerLinesDown(group: SVGGElement): SVGGElement {
	// 	const box = (group.children[0] as SVGGraphicsElement).getBBox();
	// 	const LEDGER_LINE_EXT_LEN = box.width*0.5;
	// 	const x0 = box.x - LEDGER_LINE_EXT_LEN;
	// 	const x1 = box.x + box.width + LEDGER_LINE_EXT_LEN;
	// 	const y0 = box.y;
	// }
	// private addLedgerLinesUp
	
}
customElements.define("music-stave", MusicStave);
