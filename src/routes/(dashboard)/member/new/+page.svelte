<script lang="ts">
	import { goto } from '$app/navigation';
	import Breadcrumb from '#lib/components/Breadcrumb.svelte';
	import MemberForm from '#lib/components/MemberForm.svelte';
	import type { Member } from '#lib/types';
	import type { MemberInput } from '#lib/utils/memberValidation';

	async function createMember(input: MemberInput): Promise<Record<string, string> | null> {
		const res = await fetch('/api/members', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify(input)
		});

		if (res.status === 400) {
			const body = (await res.json()) as { errors?: Record<string, string> };
			return body.errors ?? {};
		}
		if (!res.ok) return { form: 'Could not save this member. Please try again.' };

		const created = (await res.json()) as Member;
		await goto(`/member/${created.id}`);
		return null;
	}
</script>

<svelte:head>
	<title>Add Member — TokoKu</title>
</svelte:head>

<div class="space-y-3">
	<Breadcrumb
		items={[{ label: 'Home', href: '/' }, { label: 'Members', href: '/member' }, { label: 'Add Member' }]}
	/>

	<div class="max-w-2xl rounded-lg border border-line bg-white">
		<div class="border-b border-line px-5 py-4">
			<h2 class="text-xl font-semibold text-primary">Add Member</h2>
			<p class="mt-1 text-xs text-muted">Create a new member record.</p>
		</div>

		<div class="p-5">
			<MemberForm onSubmit={createMember} />
		</div>
	</div>
</div>
