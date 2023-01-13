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

	private drawClef(clefType: "Treble" | "Bass"): void {
		let MAGIC_height;
		let MAGIC_y;
		if (clefType === "Treble") {
			this.clefType = "Treble";
			this.svg.insertAdjacentHTML("beforeend",
										this.TREBLE_CLEF_SVG_STRING);
			MAGIC_height = 14.78;
			MAGIC_y = 2.8;
		}
		else if (clefType === "Bass") {
			this.clefType = "Bass";
			this.svg.insertAdjacentHTML("beforeend",
										this.BASS_CLEF_SVG_STRING);
			MAGIC_height = 6.88;
			MAGIC_y = 6;
		}
		const clef = this.svg.getElementById("clef");
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
			group.setAttribute("part", "markerGroup");
			this.markerGroups.push(group);
			this.svg.append(group);
			const marker = document.createElementNS("http://www.w3.org/2000/svg",
													"circle");
			group.append(marker);
			const y = positions[i];
			marker.setAttribute("r", `2%`);
			marker.setAttribute("cx", `${x0 + dx*(i+1)}`);
			marker.setAttribute("cy", `${y}`);
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
		let y = Math.round(box.height/2 + box.y);
		const incrementSign = (y > this.STAVE_LAST_LINE_POS ? -1 : 1);

		if ((y % 2) === 1) {
			if (incrementSign > 0)
				y++;
			else
				y--;
		}
		let counter = 0;
		while ((y < this.STAVE_FIRST_LINE_POS) ||
			(y > this.STAVE_LAST_LINE_POS)) {
			const line = this.drawLine(x0, y, x1, y);
			line.setAttribute("part", "ledgerLine");
			lines.push(line);
			y += 2*incrementSign;
			if (counter++ === 1000)
				throw new Error("Something went wrong while adding ledger lines.");
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

	TREBLE_CLEF_SVG_STRING = `
<svg id="clef" viewBox="0 0 1.2601 3.5572">
 <g transform="translate(-74.467 -56.429)" stroke-width=".26458" aria-label="𝄞">
  <path d="m75.012 57.517c-0.09463-0.33098-0.11072-0.72517 0.11125-1.0108 0.0863-0.16098 0.2238-0.03821 0.25732 0.08838 0.17806 0.39836 0.06839 0.90329-0.24914 1.2004 0.02402 0.11531 0.04805 0.23061 0.07207 0.34592 0.21494-0.05089 0.42264 0.10959 0.48942 0.30815 0.09243 0.23825-0.0043 0.55131-0.25236 0.64976-0.08014 0.06304 0.03188 0.23185 0.02612 0.33756 0.04179 0.15918 0.03769 0.35568-0.10469 0.4649-0.18747 0.15761-0.54956 0.09338-0.60893-0.16424-0.03763-0.13352 0.0481-0.30945 0.20337-0.29692 0.18348-0.0096 0.26871 0.26686 0.11646 0.36612-0.04331 0.04513-0.1916 0.0076-0.07792 0.0802 0.15922 0.09099 0.38013-0.01768 0.41139-0.19722 0.04045-0.18605-0.04643-0.36621-0.07309-0.54768-0.3735 0.10428-0.77132-0.18446-0.84668-0.55257-0.06186-0.25043 0.03136-0.51014 0.1871-0.70689 0.10091-0.13179 0.22215-0.24738 0.33832-0.36505zm0.05559-0.05148c0.14179-0.09725 0.22009-0.26343 0.28415-0.41799 0.04016-0.10088 0.07091-0.33118-0.09458-0.31632-0.13887 0.05525-0.18382 0.22157-0.21498 0.35396-0.02464 0.12671-0.02374 0.25928 0.02541 0.38035zm0.11737 0.9204c-0.16702 0.03858-0.27848 0.25298-0.17321 0.4023 0.0231 0.0568 0.22408 0.16625 0.05891 0.11865-0.19223-0.07593-0.27239-0.32027-0.18425-0.50241 0.03354-0.12628 0.1843-0.19433 0.24487-0.26937-0.01848-0.09621-0.03695-0.19242-0.05543-0.28863-0.23418 0.18948-0.46913 0.44564-0.46301 0.76615 0.0056 0.30372 0.32349 0.54286 0.61744 0.48167 0.10807 0.01246 0.08847-0.06072 0.06861-0.13189-0.03797-0.19215-0.07594-0.38431-0.11392-0.57646zm0.19973 0.66713c0.24121-0.0957 0.27766-0.48555 0.05357-0.62083-0.05873-0.03996-0.23435-0.10594-0.17454 0.01961 0.04033 0.20041 0.08065 0.40082 0.12098 0.60122z"/>
 </g>
</svg>
`
	BASS_CLEF_SVG_STRING = `
<svg id="clef" viewBox="0 0 1.4252 1.6457">
<g transform="translate(-80.532 -56.884)">
<g stroke-width=".26458" aria-label="𝄢">
<path d="m80.532 58.484c0.19975-0.13448 0.40818-0.26532 0.56662-0.44956 0.15498-0.18922 0.25928-0.42802 0.26318-0.67468 0.0019-0.15093-0.0508-0.32966-0.2004-0.39502-0.12446-0.04809-0.26782-0.0065-0.37339 0.06703-0.04874 0.03095-0.13324 0.15101-0.03363 0.16526 0.07799-0.0161 0.17182-0.03448 0.23474 0.03086 0.0782 0.07043 0.05986 0.20768-0.02815 0.26169-0.13385 0.09995-0.36328 0.0094-0.3743-0.16292-0.01815-0.18017 0.11589-0.3431 0.27981-0.40164 0.22027-0.08418 0.49916-0.04239 0.65528 0.14472 0.12251 0.13568 0.14952 0.333 0.10331 0.5053-0.06086 0.22289-0.21721 0.40888-0.39504 0.5506-0.21132 0.16048-0.44686 0.28533-0.6836 0.40357-0.0048-0.01507-0.0096-0.03014-0.01443-0.04521zm1.3116-1.4125c0.09229-0.0057 0.1495 0.11708 0.08802 0.18508-0.05764 0.07435-0.19704 0.03707-0.20074-0.06023-0.0088-0.06468 0.04734-0.1274 0.11272-0.12486zm0 0.45299c0.09229-0.0057 0.1495 0.11709 0.08802 0.18509-0.05764 0.07435-0.19704 0.03707-0.20074-0.06023-0.0088-0.06467 0.04734-0.12741 0.11272-0.12486z"/>
</g>
</g>
</svg>
`
}
customElements.define("music-stave", MusicStave);
