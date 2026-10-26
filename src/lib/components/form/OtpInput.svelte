<script lang="ts">
	import { untrack } from 'svelte';
	import { errorClass, hintClass, labelClass } from './formStyles';

	let {
		label,
		value = $bindable(''),
		length = 6,
		hint,
		error,
		disabled = false
	}: {
		label: string;
		value?: string;
		length?: number;
		hint?: string;
		error?: string;
		disabled?: boolean;
	} = $props();

	const id = $props.id();
	let digits = $state<string[]>(
		untrack(() => Array.from({ length }, (_, index) => value[index] ?? ''))
	);
	let boxes: (HTMLInputElement | null)[] = [];

	function sync() {
		value = digits.join('');
	}

	function focusBox(index: number) {
		boxes[Math.min(length - 1, Math.max(0, index))]?.focus();
	}

	function onInput(index: number, event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const digit = input.value.replace(/\D/g, '').slice(-1);
		digits[index] = digit;
		sync();
		input.value = digit;
		if (digit) focusBox(index + 1);
	}

	function onKeydown(index: number, event: KeyboardEvent) {
		if (event.key === 'Backspace' && !digits[index]) {
			event.preventDefault();
			digits[index - 1] = '';
			sync();
			focusBox(index - 1);
		} else if (event.key === 'ArrowLeft') {
			event.preventDefault();
			focusBox(index - 1);
		} else if (event.key === 'ArrowRight') {
			event.preventDefault();
			focusBox(index + 1);
		}
	}

	function onPaste(index: number, event: ClipboardEvent) {
		event.preventDefault();
		const pasted = (event.clipboardData?.getData('text') ?? '').replace(/\D/g, '');
		if (!pasted) return;
		for (let offset = 0; offset < pasted.length && index + offset < length; offset += 1) {
			digits[index + offset] = pasted[offset];
		}
		sync();
		focusBox(index + pasted.length);
	}
</script>

<div>
	<span id={`${id}-label`} class={labelClass}>{label}</span>
	<div
		class="flex gap-2"
		role="group"
		aria-labelledby={`${id}-label`}
		aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
	>
		{#each Array.from({ length }, (_, index) => index) as index (index)}
			<input
				{@attach (node) => {
					boxes[index] = node;
					return () => {
						boxes[index] = null;
					};
				}}
				value={digits[index]}
				{disabled}
				inputmode="numeric"
				autocomplete="one-time-code"
				maxlength="1"
				aria-label="Digit {index + 1}"
				aria-invalid={error ? 'true' : undefined}
				oninput={(event) => onInput(index, event)}
				onkeydown={(event) => onKeydown(index, event)}
				onpaste={(event) => onPaste(index, event)}
				class="h-11 w-10 rounded-md border border-line-strong bg-white text-center text-sm font-medium text-ink focus:outline-2 focus:outline-primary disabled:cursor-not-allowed disabled:bg-cream"
			/>
		{/each}
	</div>
	{#if error}
		<p id={`${id}-error`} role="alert" class={errorClass}>{error}</p>
	{:else if hint}
		<p id={`${id}-hint`} class={hintClass}>{hint}</p>
	{/if}
</div>
