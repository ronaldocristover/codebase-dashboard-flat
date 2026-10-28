import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { debounce } from './debounce';

const DELAY = 250;

describe('debounce', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('invokes the function once for three rapid calls', () => {
		const fn = vi.fn();
		const { call } = debounce(fn, DELAY);

		call('a');
		call('b');
		call('c');
		vi.advanceTimersByTime(DELAY);

		expect(fn).toHaveBeenCalledTimes(1);
	});

	it('passes the arguments of the last call', () => {
		const fn = vi.fn();
		const { call } = debounce(fn, DELAY);

		call('a');
		call('b');
		vi.advanceTimersByTime(DELAY);

		expect(fn).toHaveBeenCalledWith('b');
	});

	it('waits for the full delay before calling', () => {
		const fn = vi.fn();
		const { call } = debounce(fn, DELAY);

		call('a');
		vi.advanceTimersByTime(DELAY - 1);
		expect(fn).not.toHaveBeenCalled();

		vi.advanceTimersByTime(1);
		expect(fn).toHaveBeenCalledTimes(1);
	});

	it('cancel prevents the pending call', () => {
		const fn = vi.fn();
		const { call, cancel } = debounce(fn, DELAY);

		call('a');
		cancel();
		vi.advanceTimersByTime(DELAY);

		expect(fn).not.toHaveBeenCalled();
	});

	it('still calls after a cancel followed by a new call', () => {
		const fn = vi.fn();
		const { call, cancel } = debounce(fn, DELAY);

		call('a');
		cancel();
		call('b');
		vi.advanceTimersByTime(DELAY);

		expect(fn).toHaveBeenCalledTimes(1);
		expect(fn).toHaveBeenCalledWith('b');
	});
});
