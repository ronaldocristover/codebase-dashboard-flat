<script lang="ts">
	import Breadcrumb from '#lib/components/Breadcrumb.svelte';
	import Button from '#lib/components/form/Button.svelte';
	import Checkbox from '#lib/components/form/Checkbox.svelte';
	import DateInput from '#lib/components/form/DateInput.svelte';
	import DateRangeInput from '#lib/components/form/DateRangeInput.svelte';
	import DropdownMenu from '#lib/components/form/DropdownMenu.svelte';
	import FileUpload from '#lib/components/form/FileUpload.svelte';
	import MarkdownInput from '#lib/components/form/MarkdownInput.svelte';
	import MonthInput from '#lib/components/form/MonthInput.svelte';
	import MultiDateInput from '#lib/components/form/MultiDateInput.svelte';
	import MultiFileUpload from '#lib/components/form/MultiFileUpload.svelte';
	import PasswordInput from '#lib/components/form/PasswordInput.svelte';
	import RadioGroup from '#lib/components/form/RadioGroup.svelte';
	import RichTextInput from '#lib/components/form/RichTextInput.svelte';
	import Select from '#lib/components/form/Select.svelte';
	import StepProgress from '#lib/components/form/StepProgress.svelte';
	import Stepper from '#lib/components/form/Stepper.svelte';
	import Switch from '#lib/components/form/Switch.svelte';
	import TextArea from '#lib/components/form/TextArea.svelte';
	import TextInput from '#lib/components/form/TextInput.svelte';
	import TimeInput from '#lib/components/form/TimeInput.svelte';

	let name = $state('');
	let email = $state('');
	let notes = $state('');
	let richText = $state('<p>Hello <strong>world</strong> — edit this content.</p>');
	let markdown = $state(
		'## Markdown\n\nThis is **bold**, *italic*, and `code`.\n\n- First item\n- Second item'
	);
	let status = $state('active');
	let role = $state('admin');
	let password = $state('');
	let notify = $state(true);
	let storeOpen = $state(true);
	let terms = $state(false);
	let saving = $state(false);
	let saved = $state(false);
	let menuChoice = $state('');
	let singleDate = $state('');
	let rangeStart = $state('');
	let rangeEnd = $state('');
	let time = $state('');
	let month = $state('');
	let multiDates = $state<string[]>([]);
	let singleFile = $state<File | null>(null);
	let galleryFiles = $state<File[]>([]);
	let quantity = $state(1);
	let step = $state(1);

	function saveDemo() {
		saving = true;
		saved = false;
		setTimeout(() => {
			saving = false;
			saved = true;
		}, 1200);
	}
</script>

<svelte:head>
	<title>Form Element — TokoKu</title>
</svelte:head>

<div class="space-y-3">
	<Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Form Element' }]} />

	<div class="flex flex-wrap items-end justify-between gap-2">
		<div>
			<h2 class="text-xl font-semibold text-primary">Form Element</h2>
			<p class="mt-1 text-xs text-muted">
				Reusable, flat-styled fields ready to drop into any form.
			</p>
		</div>
		{#if saved}
			<span
				role="status"
				class="rounded-md border border-success-line bg-success-bg px-2 py-1 text-xs font-medium text-success"
			>
				Saved
			</span>
		{/if}
	</div>

	{#snippet panel(title: string, description: string)}
		<div class="border-b border-line px-4 py-3">
			<h3 class="text-sm font-semibold text-ink">{title}</h3>
			<p class="text-xs text-muted">{description}</p>
		</div>
	{/snippet}

	<div class="grid gap-3 lg:grid-cols-2">
		<section class="rounded-lg border border-line bg-white lg:col-span-2">
			{@render panel('Text inputs and selection', 'Text, textarea, select, and radio group.')}
			<div class="space-y-4 p-4">
				<div class="grid gap-4 sm:grid-cols-2">
					<TextInput label="Full name" bind:value={name} placeholder="Siti Aminah" hint="As shown on the account." />
					<TextInput
						label="Email"
						type="email"
						bind:value={email}
						placeholder="you@example.com"
						error="Email is already used"
					/>
					<Select
						label="Status"
						bind:value={status}
						options={[
							{ value: 'active', label: 'Active' },
							{ value: 'inactive', label: 'Inactive' }
						]}
					/>
					<TextInput label="Disabled field" value="Read only" disabled hint="Disabled state." />
				</div>
				<TextArea label="Notes" bind:value={notes} placeholder="Add a short note…" />
				<RadioGroup
					label="Role"
					name="role"
					bind:value={role}
					options={[
						{ value: 'admin', label: 'Admin' },
						{ value: 'staff', label: 'Staff' },
						{ value: 'viewer', label: 'Viewer' }
					]}
				/>
			</div>
		</section>

		<section class="rounded-lg border border-line bg-white lg:col-span-2">
			{@render panel('Rich text and Markdown', 'Editable HTML with a formatting toolbar, and a Markdown editor with preview.')}
			<div class="grid gap-4 p-4 lg:grid-cols-2">
				<RichTextInput
					label="Rich text (HTML)"
					bind:value={richText}
					placeholder="Write formatted content…"
					hint="Output is HTML. Use the toolbar to format the selection."
				/>
				<MarkdownInput
					label="Markdown"
					bind:value={markdown}
					hint="Supports headings, lists, links, quotes, and code."
				/>
			</div>
		</section>

		<section class="rounded-lg border border-line bg-white">
			{@render panel('Password', 'Password field with a show/hide toggle.')}
			<div class="p-4">
				<PasswordInput
					label="Password"
					bind:value={password}
					placeholder="Enter a password"
					hint="At least 8 characters."
				/>
			</div>
		</section>

		<section class="rounded-lg border border-line bg-white">
			{@render panel('Checkbox and switch', 'Styled checkbox and toggle switch.')}
			<div class="space-y-4 p-4">
				<Checkbox label="Email me about order updates" bind:checked={notify} hint="Optional." />
				<Checkbox label="I agree to the terms" bind:checked={terms} />
				<Switch label="Store is open" bind:checked={storeOpen} />
			</div>
		</section>

		<section class="rounded-lg border border-line bg-white">
			{@render panel('Buttons', 'Variants, icons, and states.')}
			<div class="space-y-4 p-4">
				<div class="flex flex-wrap items-center gap-2">
					<Button>Primary</Button>
					<Button variant="secondary">Secondary</Button>
					<Button variant="ghost">Ghost</Button>
					<Button variant="danger">Danger</Button>
					<Button variant="success">Success</Button>
				</div>
				<div class="flex flex-wrap items-center gap-2">
					<Button icon="plus">Add member</Button>
					<Button variant="secondary" icon="upload" iconPosition="right">Upload</Button>
					<Button variant="ghost" size="sm" icon="check">Small with icon</Button>
				</div>
				<div class="flex flex-wrap items-center gap-2">
					<Button disabled>Disabled</Button>
					<Button loading={saving} onclick={saveDemo}>Save changes</Button>
					{#if saved}
						<Button variant="success" icon="check">Saved</Button>
					{/if}
				</div>
			</div>
		</section>

		<section class="rounded-lg border border-line bg-white">
			{@render panel('Dropdown menu', 'Closes on outside click and Escape.')}
			<div class="space-y-3 p-4">
				<DropdownMenu
					label="Actions"
					items={[
						{ label: 'Edit member', value: 'edit' },
						{ label: 'Reset password', value: 'reset' },
						{ label: 'Delete member', value: 'delete', danger: true }
					]}
					onSelect={(value) => (menuChoice = value)}
				/>
				<p class="text-xs text-muted">
					{menuChoice ? `Selected action: ${menuChoice}` : 'No action selected yet.'}
				</p>
			</div>
		</section>

		<section class="rounded-lg border border-line bg-white lg:col-span-2">
			{@render panel('Dates and time', 'Single date, date range, time, month, and multiple dates.')}
			<div class="space-y-4 p-4">
				<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					<DateInput label="Single date" bind:value={singleDate} />
					<TimeInput label="Time" bind:value={time} />
					<MonthInput label="Month" bind:value={month} />
				</div>
				<DateRangeInput
					bind:start={rangeStart}
					bind:end={rangeEnd}
					hint="The end date cannot be earlier than the start date."
				/>
				<MultiDateInput
					label="Multiple dates"
					bind:dates={multiDates}
					max={5}
					hint="Pick up to five dates."
				/>
			</div>
		</section>

		<section class="rounded-lg border border-line bg-white lg:col-span-2">
			{@render panel('File uploads', 'Single file and multiple image uploads with thumbnails.')}
			<div class="grid gap-4 p-4 lg:grid-cols-2">
				<FileUpload label="Single file" bind:file={singleFile} hint="PDF or image, up to 5 MB." />
				<MultiFileUpload
					label="Product gallery"
					bind:files={galleryFiles}
					maxFiles={6}
					hint="Upload up to six images."
				/>
			</div>
		</section>

		<section class="rounded-lg border border-line bg-white lg:col-span-2">
			{@render panel('Stepper', 'Numeric stepper and step progress.')}
			<div class="grid gap-6 p-4 lg:grid-cols-2">
				<div>
					<Stepper label="Quantity" bind:value={quantity} min={1} max={10} hint="Choose between 1 and 10." />
				</div>
				<div>
					<StepProgress steps={['Account', 'Store', 'Review']} current={step} />
					<div class="mt-4 flex gap-2">
						<Button
							variant="secondary"
							size="sm"
							disabled={step === 0}
							onclick={() => (step = Math.max(0, step - 1))}
						>
							Back
						</Button>
						<Button size="sm" disabled={step === 2} onclick={() => (step = Math.min(2, step + 1))}>
							Next
						</Button>
					</div>
				</div>
			</div>
		</section>
	</div>
</div>
