<script lang="ts">
	const user = { nama: 'Rina Setiawan', email: 'rina@tokoku.id', inisial: 'RS' };

	let open = $state(false);
	let akar: HTMLDivElement;

	$effect(() => {
		if (!open) return;

		const klikLuar = (event: MouseEvent) => {
			if (akar && !akar.contains(event.target as Node)) {
				open = false;
			}
		};
		const tombolEsc = (event: KeyboardEvent) => {
			if (event.key === 'Escape') open = false;
		};

		document.addEventListener('click', klikLuar);
		document.addEventListener('keydown', tombolEsc);

		return () => {
			document.removeEventListener('click', klikLuar);
			document.removeEventListener('keydown', tombolEsc);
		};
	});
</script>

<div class="relative" bind:this={akar}>
	<button
		type="button"
		class="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-primary text-xs font-semibold text-white"
		aria-haspopup="menu"
		aria-expanded={open}
		onclick={() => (open = !open)}
	>
		{user.inisial}
	</button>

	{#if open}
		<div
			class="absolute right-0 top-11 z-50 w-56 rounded-lg border border-line bg-white p-1.5"
			role="menu"
		>
			<div class="border-b border-line px-2 py-2">
				<div class="text-sm font-semibold">{user.nama}</div>
				<div class="text-[11px] text-muted">{user.email}</div>
			</div>

			<button
				type="button"
				class="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-[13px] text-ink hover:bg-cream"
				role="menuitem"
			>
				<span class="h-3 w-3 rounded-sm bg-line"></span>
				My Profile
			</button>
			<button
				type="button"
				class="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-[13px] text-ink hover:bg-cream"
				role="menuitem"
			>
				<span class="h-3 w-3 rounded-sm bg-line"></span>
				Store Settings
			</button>
			<button
				type="button"
				class="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-[13px] text-ink hover:bg-cream"
				role="menuitem"
			>
				<span class="h-3 w-3 rounded-sm bg-line"></span>
				Notifications
				<span class="ml-auto rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-white">
					3
				</span>
			</button>

			<div class="my-1 h-px bg-line"></div>

			<form method="POST" action="/logout" role="none">
				<button
					type="submit"
					class="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-[13px] text-danger hover:bg-danger/10"
					role="menuitem"
				>
					<span class="h-3 w-3 rounded-sm bg-danger/20"></span>
					Sign out
				</button>
			</form>
		</div>
	{/if}
</div>
