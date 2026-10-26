<script lang="ts">
	import { untrack } from 'svelte';
	import type { Member, MemberStatus } from '#lib/types';
	import { validateMemberInput, type MemberInput } from '#lib/utils/memberValidation';

	let {
		member,
		onSubmit
	}: {
		member?: Member;
		onSubmit: (input: MemberInput) => Promise<Record<string, string> | null>;
	} = $props();

	// Fields are seeded from the member once; the edit page keys this component per member.
	let nama = $state(untrack(() => member?.nama ?? ''));
	let email = $state(untrack(() => member?.email ?? ''));
	let hp = $state(untrack(() => member?.hp ?? ''));
	let status = $state<MemberStatus>(untrack(() => member?.status ?? 'aktif'));

	let errors = $state<Record<string, string>>({});
	let saving = $state(false);

	async function submit(event: SubmitEvent) {
		event.preventDefault();
		if (saving) return;

		const input: MemberInput = { nama, email, hp, status };
		const clientErrors = validateMemberInput(input);
		if (Object.keys(clientErrors).length > 0) {
			errors = clientErrors;
			return;
		}

		errors = {};
		saving = true;
		try {
			const serverErrors = await onSubmit(input);
			if (serverErrors) errors = serverErrors;
		} finally {
			saving = false;
		}
	}

	const field =
		'w-full rounded-md border border-line-strong bg-white px-2.5 py-2 text-xs text-ink focus:outline-2 focus:outline-primary';
	const label = 'mb-1 block text-[11px] font-medium text-ink';
	const error = 'mt-1 text-[11px] text-danger';
</script>

<form class="space-y-3" onsubmit={submit} novalidate>
	{#if errors.form}
		<p role="alert" class="rounded-md border border-danger px-3 py-2 text-xs text-danger">
			{errors.form}
		</p>
	{/if}

	<div class="grid gap-3 sm:grid-cols-2">
		<div>
			<label for="member-nama" class={label}>Name</label>
			<input
				id="member-nama"
				bind:value={nama}
				class={field}
				aria-invalid={errors.nama ? 'true' : undefined}
				aria-describedby={errors.nama ? 'member-nama-error' : undefined}
			/>
			{#if errors.nama}
				<p id="member-nama-error" role="alert" class={error}>{errors.nama}</p>
			{/if}
		</div>

		<div>
			<label for="member-email" class={label}>Email</label>
			<input
				id="member-email"
				type="email"
				bind:value={email}
				class={field}
				aria-invalid={errors.email ? 'true' : undefined}
				aria-describedby={errors.email ? 'member-email-error' : undefined}
			/>
			{#if errors.email}
				<p id="member-email-error" role="alert" class={error}>{errors.email}</p>
			{/if}
		</div>

		<div>
			<label for="member-hp" class={label}>Phone</label>
			<input
				id="member-hp"
				type="tel"
				bind:value={hp}
				class={field}
				aria-invalid={errors.hp ? 'true' : undefined}
				aria-describedby={errors.hp ? 'member-hp-error' : undefined}
			/>
			{#if errors.hp}
				<p id="member-hp-error" role="alert" class={error}>{errors.hp}</p>
			{/if}
		</div>

		<div>
			<label for="member-status" class={label}>Status</label>
			<select
				id="member-status"
				bind:value={status}
				class={field}
				aria-invalid={errors.status ? 'true' : undefined}
				aria-describedby={errors.status ? 'member-status-error' : undefined}
			>
				<option value="aktif">Active</option>
				<option value="nonaktif">Inactive</option>
			</select>
			{#if errors.status}
				<p id="member-status-error" role="alert" class={error}>{errors.status}</p>
			{/if}
		</div>
	</div>

	<div class="flex flex-wrap items-center gap-2 pt-1">
		<button
			type="submit"
			disabled={saving}
			class="rounded-md bg-primary px-3 py-2 text-xs font-semibold text-white hover:bg-primary/90 disabled:opacity-60"
		>
			{saving ? 'Saving…' : member ? 'Save Changes' : 'Save Member'}
		</button>
		<a
			href={member ? `/member/${member.id}` : '/member'}
			class="rounded-md border border-line-strong px-3 py-2 text-xs font-medium text-ink hover:bg-cream"
		>
			Cancel
		</a>
	</div>
</form>
