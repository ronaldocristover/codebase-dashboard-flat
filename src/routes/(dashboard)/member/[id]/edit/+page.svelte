<script lang="ts">
	import { goto } from '$app/navigation';
	import Breadcrumb from '#lib/components/Breadcrumb.svelte';
	import MemberForm from '#lib/components/MemberForm.svelte';
	import type { Member } from '#lib/types';
	import type { MemberInput } from '#lib/utils/memberValidation';

	let { data }: { data: { member: Member } } = $props();

	async function updateMember(input: MemberInput): Promise<Record<string, string> | null> {
		const res = await fetch(`/api/members/${data.member.id}`, {
			method: 'PATCH',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify(input)
		});

		if (res.status === 400) {
			const body = (await res.json()) as { errors?: Record<string, string> };
			return body.errors ?? {};
		}
		if (res.status === 404) return { form: 'Member not found.' };
		if (!res.ok) return { form: 'Could not save this member. Please try again.' };

		await goto(`/member/${data.member.id}`);
		return null;
	}
</script>

<svelte:head>
	<title>Edit {data.member.nama} — TokoKu</title>
</svelte:head>

<div class="space-y-3">
	<Breadcrumb
		items={[
			{ label: 'Home', href: '/' },
			{ label: 'Members', href: '/member' },
			{ label: data.member.nama, href: `/member/${data.member.id}` },
			{ label: 'Edit' }
		]}
	/>

	<div class="rounded-lg border border-line bg-white p-4">
		<h2 class="text-xl font-semibold text-primary">Edit Member</h2>
		<p class="mt-0.5 text-[11px] text-muted">{data.member.nama}</p>

		<div class="mt-4 max-w-2xl">
			{#key data.member.id}
				<MemberForm member={data.member} onSubmit={updateMember} />
			{/key}
		</div>
	</div>
</div>
