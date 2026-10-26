<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import { auth, login } from '#lib/stores/auth';
	import Logo from '#lib/components/Logo.svelte';

	const POLA_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

	let email = $state('');
	let password = $state('');
	let errorEmail = $state('');
	let errorPassword = $state('');

	onMount(() => {
		if (get(auth)) goto('/');
	});

	function kirim(event: SubmitEvent) {
		event.preventDefault();
		errorEmail = '';
		errorPassword = '';

		if (email.trim() === '') {
			errorEmail = 'Email wajib diisi';
		} else if (!POLA_EMAIL.test(email.trim())) {
			errorEmail = 'Format email tidak valid';
		}

		if (password.trim() === '') {
			errorPassword = 'Kata sandi wajib diisi';
		}

		if (errorEmail || errorPassword) return;

		if (login(email, password)) {
			goto('/');
		}
	}

	const kolom =
		'w-full rounded-md border border-line-strong bg-white px-3 py-2.5 text-sm text-ink outline-none placeholder:text-muted focus:border-primary';
</script>

<svelte:head>
	<title>Masuk — TokoKu</title>
</svelte:head>

<div class="grid min-h-screen bg-cream md:grid-cols-2">
	<div class="flex flex-col justify-between gap-8 bg-primary p-6 text-white md:p-10">
		<Logo onDark size="lg" />

		<div class="max-w-sm">
			<h1 class="text-xl font-semibold leading-snug md:text-2xl">
				Kelola tokomu dalam satu dashboard
			</h1>
			<p class="mt-2 text-sm text-white/80">
				Pantau penjualan, pesanan, dan member dari mana saja.
			</p>
		</div>

		<div class="text-[11px] uppercase tracking-[0.15em] text-white/60">© 2026 TokoKu</div>
	</div>

	<div class="flex items-center justify-center p-6 md:p-10">
		<form class="w-full max-w-sm" onsubmit={kirim} novalidate>
			<h2 class="text-xl font-semibold text-primary">Masuk</h2>
			<p class="mb-5 mt-1 text-xs text-muted">Gunakan akun admin toko kamu</p>

			<label for="email" class="mb-1 block text-xs font-medium text-ink">Email</label>
			<input
				id="email"
				name="email"
				type="email"
				bind:value={email}
				class={kolom}
				placeholder="nama@tokoku.id"
				autocomplete="email"
				aria-invalid={errorEmail ? true : undefined}
				aria-describedby={errorEmail ? 'email-error' : undefined}
			/>
			{#if errorEmail}
				<p id="email-error" role="alert" class="mt-1 text-xs font-medium text-danger">{errorEmail}</p>
			{/if}

			<label for="password" class="mb-1 mt-4 block text-xs font-medium text-ink">
				Kata sandi
			</label>
			<input
				id="password"
				name="password"
				type="password"
				bind:value={password}
				class={kolom}
				placeholder="••••••••"
				autocomplete="current-password"
				aria-invalid={errorPassword ? true : undefined}
				aria-describedby={errorPassword ? 'password-error' : undefined}
			/>
			{#if errorPassword}
				<p id="password-error" role="alert" class="mt-1 text-xs font-medium text-danger">
					{errorPassword}
				</p>
			{/if}

			<div class="mt-3 flex items-center justify-between text-xs text-ink">
				<label class="flex items-center gap-2">
					<input type="checkbox" class="h-3.5 w-3.5 accent-primary" />
					Ingat saya
				</label>
				<button type="button" aria-disabled="true" class="font-medium text-primary">Lupa sandi?</button>
			</div>

			<button
				type="submit"
				class="mt-5 w-full rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary/90"
			>
				Masuk ke Dashboard
			</button>

			<p class="mt-4 text-center text-xs text-muted">
				Belum punya akun?
				<button type="button" aria-disabled="true" class="font-medium text-primary">Daftar</button>
			</p>
		</form>
	</div>
</div>
