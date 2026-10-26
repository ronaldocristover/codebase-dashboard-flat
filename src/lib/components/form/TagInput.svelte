<script lang="ts">
	import Icon from './Icon.svelte';
	import { hintClass, labelClass } from './formStyles';

	let {
		label,
		tags = $bindable<string[]>([]),
		placeholder = 'Type and press Enter',
		max = Infinity,
		hint,
		disabled = false
	}: {
		label: string;
		tags?: string[];
		placeholder?: string;
		max?: number;
		hint?: string;
		disabled?: boolean;
	} = $props();

	const id = $props.id();
	let draft = $state('');

	function add() {
		const next = draft.replace(/,+$/, '').trim();
		draft = '';
		if (!next || tags.includes(next) || tags.length >= max) return;
		tags = [...tags, next];
	}

	function remove(tag: string) {
		tags = tags.filter((item) => item !== tag);
	}

	function onKeydown(event: KeyboardEvent) {
		if (disabled) return;

		if (event.key === 'Enter' || event.key === ',') {
			event.preventDefault();
			add();
		} else if (event.key === 'Backspace' && draft === '' && tags.length > 0) {
			tags = tags.slice(0, -1);
		}
	}
</script>

<div>
	<label for={id} class={labelClass}>{label}</label>
	<div class="rounded-md border border-line-strong bg-white px-2 py-1.5 focus-within:outline-2 focus-within:outline-primary">
		{#if tags.length > 0}
			<ul class="mb-1 flex flex-wrap gap-1">
				{#each tags as tag (tag)}
					<li class="inline-flex items-center gap-1 rounded border border-line bg-cream px-2 py-0.5 text-[11px] text-ink">
						{tag}
						<button
							type="button"
							{disabled}
							class="cursor-pointer rounded p-0.5 text-muted hover:text-danger disabled:cursor-not-allowed"
							aria-label="Remove {tag}"
							onclick={() => remove(tag)}
						>
							<Icon name="x" class="h-3 w-3" />
						</button>
					</li>
				{/each}
			</ul>
		{/if}
		<input
			{id}
			bind:value={draft}
			{placeholder}
			{disabled}
			onkeydown={onKeydown}
			onblur={add}
			class="w-full bg-transparent py-1 text-sm text-ink placeholder:text-muted focus:outline-none"
			aria-describedby={hint ? `${id}-hint` : undefined}
		/>
	</div>
	{#if hint}<p id={`${id}-hint`} class={hintClass}>{hint}</p>{/if}
</div>
