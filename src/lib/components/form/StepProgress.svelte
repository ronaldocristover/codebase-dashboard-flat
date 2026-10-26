<script lang="ts">
	import Icon from './Icon.svelte';

	let { steps, current = 0 }: { steps: string[]; current?: number } = $props();
</script>

<div class="overflow-x-auto">
	<ol class="flex min-w-max items-start">
		{#each steps as step, i (step)}
			<li class="flex items-start" aria-current={i === current ? 'step' : undefined}>
				<div class="flex w-20 flex-col items-center gap-1.5 text-center">
					<span
						class="flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold {i < current
							? 'bg-primary text-white'
							: i === current
								? 'border-2 border-primary bg-primary-soft text-primary'
								: 'border border-line-strong bg-white text-muted'}"
					>
						{#if i < current}
							<Icon name="check" class="h-3.5 w-3.5" />
						{:else}
							{i + 1}
						{/if}
					</span>
					<span class="text-[11px] font-medium {i <= current ? 'text-primary' : 'text-muted'}">
						{step}
					</span>
				</div>
				{#if i < steps.length - 1}
					<span class="mt-3.5 h-px w-8 {i < current ? 'bg-primary' : 'bg-line'}"></span>
				{/if}
			</li>
		{/each}
	</ol>
</div>
