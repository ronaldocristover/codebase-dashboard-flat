<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from './Icon.svelte';

	let {
		variant = 'info',
		title,
		onDismiss,
		children
	}: {
		variant?: 'info' | 'success' | 'warning' | 'danger';
		title?: string;
		onDismiss?: () => void;
		children: Snippet;
	} = $props();

	const tone = {
		info: 'border-line-strong bg-cream text-ink',
		success: 'border-success-line bg-success-bg text-success',
		warning: 'border-warning-line bg-warning-bg text-warning',
		danger: 'border-danger bg-white text-danger'
	};
</script>

<div
	role={variant === 'danger' ? 'alert' : 'status'}
	class="flex items-start gap-3 rounded-md border px-3 py-2.5 text-xs {tone[variant]}"
>
	<div class="flex-1">
		{#if title}<p class="font-semibold">{title}</p>{/if}
		<div class={title ? 'mt-0.5' : ''}>{@render children()}</div>
	</div>
	{#if onDismiss}
		<button
			type="button"
			class="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded text-current opacity-70 hover:bg-black/5 hover:opacity-100"
			aria-label="Dismiss alert"
			onclick={onDismiss}
		>
			<Icon name="x" class="h-3.5 w-3.5" />
		</button>
	{/if}
</div>
