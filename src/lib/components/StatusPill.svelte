<script lang="ts">
	import type { MemberStatus, OrderStatus } from '#lib/types';

	let { status }: { status: MemberStatus | OrderStatus } = $props();

	const peta: Record<MemberStatus | OrderStatus, { label: string; kelas: string }> = {
		aktif: { label: 'Active', kelas: 'bg-success-bg text-success border-success-line' },
		nonaktif: { label: 'Inactive', kelas: 'bg-warning-bg text-warning border-warning-line' },
		lunas: { label: 'Paid', kelas: 'bg-success-bg text-success border-success-line' },
		dikirim: { label: 'Shipped', kelas: 'bg-info-bg text-info border-info-line' },
		menunggu: { label: 'Pending', kelas: 'bg-warning-bg text-warning border-warning-line' }
	};

	const info = $derived(peta[status]);
</script>

<span class="rounded-full border px-2 py-0.5 text-[10px] font-medium {info.kelas}">{info.label}</span>
