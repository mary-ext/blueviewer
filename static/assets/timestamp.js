const SECOND = 1e3;
const MINUTE = SECOND * 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;
const WEEK = DAY * 7;
const MONTH = WEEK * 4;
const YEAR = MONTH * 12;

const absDisplayFmt = new Intl.DateTimeFormat('en-US', { dateStyle: 'long' });
const absTitleFmt = new Intl.DateTimeFormat('en-US', { dateStyle: 'long', timeStyle: 'medium' });

const lookupReltime = (delta) => {
	if (delta < SECOND) {
		return [0, 'second'];
	}

	if (delta < MINUTE) {
		return [Math.trunc(delta / SECOND), 'second'];
	}

	if (delta < HOUR) {
		return [Math.trunc(delta / MINUTE), 'minute'];
	}

	if (delta < DAY) {
		return [Math.trunc(delta / HOUR), 'hour'];
	}

	if (delta < WEEK) {
		return [Math.trunc(delta / DAY), 'day'];
	}

	if (delta < MONTH) {
		return [Math.trunc(delta / WEEK), 'week'];
	}

	if (delta < YEAR) {
		return [Math.trunc(delta / MONTH), 'month'];
	}

	return [Math.trunc(delta / YEAR), 'year'];
};

const nodes = document.querySelectorAll('.pl-header__timestamp, .post-header__timestamp');
const now = Date.now();

for (let idx = 0, len = nodes.length; idx < len; idx++) {
	/** @type {HTMLAnchorElement} */
	const node = nodes[idx];

	const time = new Date(node.textContent);
	const timeMs = time.getTime();

	if (Number.isNaN(time)) {
		continue;
	}

	const delta = Math.abs(timeMs - now);

	node.title = absTitleFmt.format(time);

	if (delta > WEEK) {
		node.textContent = absDisplayFmt.format(time);
	} else {
		const [value, unit] = lookupReltime(delta);
		const display = Math.abs(value).toLocaleString('en-US', { style: 'unit', unit, unitDisplay: 'narrow' });

		node.textContent = display;
	}
}
