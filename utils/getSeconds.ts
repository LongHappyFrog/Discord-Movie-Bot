export function getSeconds(timeStr: string) {
	let seconds = 0;
	const days = timeStr.match(/(\d+)\s*d/);
	const hours = timeStr.match(/(\d+)\s*h/);
	const minutes = timeStr.match(/(\d+)\s*m/);
	if (days) { seconds += parseInt(days[1]) * 86400; }
	if (hours) { seconds += parseInt(hours[1]) * 3600; }
	if (minutes) { seconds += parseInt(minutes[1]) * 60; }
	return seconds;
}