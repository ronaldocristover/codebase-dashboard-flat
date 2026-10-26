<script lang="ts">
	import { errorClass, hintClass, inputClass, labelClass } from './formStyles';
	import Icon from './Icon.svelte';

	let {
		label,
		options,
		value = $bindable(''),
		placeholder = 'Search…',
		hint,
		error,
		name,
		disabled = false
	}: {
		label: string;
		options: { value: string; label: string }[];
		value?: string;
		placeholder?: string;
		hint?: string;
		error?: string;
		name?: string;
		disabled?: boolean;
	} = $props();

	const id = $props.id();

	let open = $state(false);
	let query = $state('');
	let active = $state(0);

	const selected = $derived(options.find((option) => option.value === value));
	const filtered = $derived(
		options.filter((option) => option.label.toLowerCase().includes(query.trim().toLowerCase()))
	);

	function attachRoot(node: HTMLDivElement) {
		return (() => {
			const onPointerDown = (event: MouseEvent) => {
				if (!node.contains(event.target as Node)) close();
			};
			document.addEventListener('mousedown', onPointerDown);
			return () => document.removeEventListener('mousedown', onPointerDown);
		})();
	}

	function close() {
		open = false;
		query = '';
	}

	function choose(option: { value: string; label: string }) {
		value = option.value;
		close();
	}

	function onFocus() {
		if (disabled) return;
		open = true;
		query = '';
		active = 0;
	}

	function onInput(event: Event) {
		query = (event.currentTarget as HTMLInputElement).value;
		open = true;
		active = 0;
	}

	function onKeydown(event: KeyboardEvent) {
		if (disabled) return;

		if (event.key === 'ArrowDown') {
			event.preventDefault();
			open = true;
			active = Math.min(active + 1, filtered.length - 1);
		} else if (event.key === 'ArrowUp') {
			event.preventDefault();
			active = Math.max(0, active - 1);
		} else if (event.key === 'Enter' && open) {
			event.preventDefault();
			if (filtered[active]) choose(filtered[active]);
		} else if (event.key === 'Escape') {
			close();
		}
	}
</script>

<div>
	<label for={id} class={labelClass}>{label}</label>
	<div {@attach attachRoot} class="relative">
		<input
			{id}
			{name}
			{disabled}
			{placeholder}
			role="combobox"
			aria-expanded={open}
			aria-controls={`${id}-listbox`}
			aria-autocomplete="list"
			aria-activedescendant={open && filtered[active] ? `${id}-option-${active}` : undefined}
			aria-invalid={error ? 'true' : undefined}
			aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
			value={open ? query : (selected?.label ?? '')}
			onfocus={onFocus}
			oninput={onInput}
			onkeydown={onKeydown}
			class="{inputClass} pr-9"
			autocomplete="off"
		/>
		<Icon
			name="chevron-down"
			class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
		/>

		{#if open}
			<ul
				id={`${id}-listbox`}
				role="listbox"
				class="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-md border border-line bg-white py-1"
			>
				{#if filtered.length === 0}
					<li class="px-3 py-2 text-xs text-muted">No matches</li>
				{:else}
					{#each filtered as option, index (option.value)}
						<li
							id={`${id}-option-${index}`}
							role="option"
							aria-selected={option.value === value}
							class="cursor-pointer px-3 py-2 text-sm {option.value === value
								? 'font-medium text-primary'
								: 'text-ink'} {index === active ? 'bg-cream' : ''}"
							onmousedown={(event) => event.preventDefault()}
							onclick={() => choose(option)}
							onkeydown={(event) => {
								if (event.key === 'Enter' || event.key === ' ') {
									event.preventDefault();
									choose(option);
								}
							}}
						>
							{option.label}
						</li>
					{/each}
				{/if}
			</ul>
		{/if}
	</div>
	{#if error}
		<p id={`${id}-error`} role="alert" class={errorClass}>{error}</p>
	{:else if hint}
		<p id={`${id}-hint`} class={hintClass}>{hint}</p>
	{/if}
</div>
