<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon, { type IconName } from './Icon.svelte';

	export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
	export type ButtonSize = 'sm' | 'md' | 'lg';

	let {
		children,
		variant = 'primary',
		size = 'md',
		icon,
		iconPosition = 'left',
		loading = false,
		disabled = false,
		type = 'button',
		onclick
	}: {
		children: Snippet;
		variant?: ButtonVariant;
		size?: ButtonSize;
		icon?: IconName;
		iconPosition?: 'left' | 'right';
		loading?: boolean;
		disabled?: boolean;
		type?: 'button' | 'submit' | 'reset';
		onclick?: (event: MouseEvent) => void;
	} = $props();

	const styles: Record<ButtonVariant, string> = {
		primary: 'bg-primary text-white hover:bg-primary/90',
		secondary: 'border border-line-strong bg-white text-ink hover:bg-cream',
		ghost: 'text-primary hover:bg-primary-soft',
		danger: 'bg-danger text-white hover:bg-danger/90',
		success: 'bg-success text-white hover:bg-success/90'
	};

	const sizes: Record<ButtonSize, string> = {
		sm: 'min-h-8 px-3 py-1.5 text-xs',
		md: 'min-h-10 px-4 py-2.5 text-sm',
		lg: 'min-h-12 px-6 py-3 text-base'
	};
</script>

<button
	{type}
	disabled={disabled || loading}
	aria-busy={loading}
	onclick={onclick}
	class="inline-flex items-center justify-center gap-2 rounded-md font-semibold transition-colors focus:outline-2 focus:outline-offset-2 focus:outline-primary disabled:cursor-not-allowed disabled:opacity-60 {styles[
		variant
	]} {sizes[size]}"
>
	{#if loading}
		<svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
			<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="3" class="opacity-25" />
			<path
				d="M21 12a9 9 0 0 0-9-9"
				stroke="currentColor"
				stroke-width="3"
				stroke-linecap="round"
			/>
		</svg>
	{:else if icon && iconPosition === 'left'}
		<Icon name={icon} />
	{/if}

	{@render children()}

	{#if icon && iconPosition === 'right' && !loading}
		<Icon name={icon} />
	{/if}
</button>
