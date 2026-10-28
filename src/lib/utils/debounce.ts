export function debounce<T extends (...args: never[]) => void>(
	fn: T,
	ms: number
): { call: T; cancel: () => void } {
	let timer: ReturnType<typeof setTimeout> | undefined;

	const call = ((...args: Parameters<T>) => {
		if (timer !== undefined) clearTimeout(timer);
		timer = setTimeout(() => {
			timer = undefined;
			fn(...args);
		}, ms);
	}) as T;

	const cancel = () => {
		if (timer !== undefined) clearTimeout(timer);
		timer = undefined;
	};

	return { call, cancel };
}
