<script lang="ts">
	let {
		message,
		variant = 'info',
		onDismiss,
		duration = 0
	}: {
		message: string;
		variant?: 'info' | 'success' | 'warning' | 'danger';
		onDismiss?: () => void;
		/** Auto-dismiss after this many milliseconds. Zero keeps the toast until dismissed. */
		duration?: number;
	} = $props();

	const tone = {
		info: 'border-line-strong bg-white text-ink',
		success: 'border-success-line bg-success-bg text-success',
		warning: 'border-warning-line bg-warning-bg text-warning',
		danger: 'border-danger bg-white text-danger'
	};

	$effect(() => {
		if (!duration) return;
		const timer = setTimeout(() => onDismiss?.(), duration);
		return () => clearTimeout(timer);
	});
</script>

<div
	role={variant === 'danger' ? 'alert' : 'status'}
	class="flex items-center gap-3 rounded-md border px-4 py-3 text-sm {tone[variant]}"
>
	<span class="flex-1">{message}</span>
	{#if onDismiss}
		<button
			type="button"
			class="cursor-pointer rounded px-1 text-current opacity-70 hover:opacity-100"
			aria-label="Dismiss notification"
			onclick={onDismiss}
		>
			✕
		</button>
	{/if}
</div>
