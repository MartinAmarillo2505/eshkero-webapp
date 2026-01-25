<script lang="ts">
	import { analyze3mfFile } from '$lib/3mf';
	import { Clock, Layers2, Weight } from 'lucide-svelte';
	import CreatePlate from './create-plate.svelte';
	import { Button } from './ui/button';
	import Input from './ui/input/input.svelte';
	import ImageInput from './image-input.svelte';

	let files = $state<FileList>();
	let product = $state<Awaited<ReturnType<typeof analyze3mfFile>>>();
	let useCustomImage = $state(false);
	let customImage = $state<File>();
	$effect(() => {
		let promise = product?.thumbnail ?? product?.plates?.[0]?.thumbnail;
		if (useCustomImage) promise = product?.fileThumbnail ?? promise;
		promise?.then((file) => (customImage = file));
	});

	let timeSeconds = $derived(
		Object.values(product?.plates ?? {}).reduce((acc, plate) => acc + (plate.timeSeconds ?? 0), 0)
	);

	let timeHours = $state<number>(0);
	let timeMinutes = $state<number>(0);

	$effect(() => {
		timeHours = Math.floor(timeSeconds / 3600);
		timeMinutes = Math.floor((timeSeconds % 3600) / 60);
	});

	$effect(() => {
		timeSeconds = (timeHours * 60 + timeMinutes) * 60;
	});

	let totalWeightGrams = $derived(
		Object.values(product?.plates ?? {}).reduce((acc, plate) => acc + (plate.weightGrams ?? 0), 0)
	);

	async function analyzeFile() {
		product = undefined;
		const file = files?.item(0);
		if (!file) return;
		if (!file.name.endsWith('.3mf') || file.name.endsWith('.gcode.3mf')) {
			alert('El archivo debe ser un archivo .3mf');
			files = undefined;
			return;
		}
		product = await analyze3mfFile(await file.arrayBuffer());
		if (!product.name) product.name = file.name.substring(0, file.name.lastIndexOf('.'));
		useCustomImage = product.fileThumbnail !== undefined;
	}

	$effect(() => {
		if (files) analyzeFile();
	});

	// TODO: allow form to handle all of this
	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		event.stopPropagation();
		const formData = new FormData(event.target as HTMLFormElement);
		console.log(Object.fromEntries(formData));
		const response = await fetch('?/create', {
			method: 'POST',
			body: formData
		});
		console.log(response);
	}
</script>

<form
	action="?/create"
	method="post"
	enctype="multipart/form-data"
	onsubmit={handleSubmit}
	class="my-2 flex flex-col gap-2 rounded bg-primary-foreground p-2">
	<Input type="file" name="file" id="file" accept=".3mf" bind:files />
	{#if product}
		<section class="mb-2 flex flex-wrap gap-2 p-2 sm:flex-nowrap">
			<div class="flex w-full gap-2">
				<div>
					<ImageInput
						class="flex aspect-square w-24 shrink-0 grow-0 items-center rounded bg-input/30 object-cover sm:w-32"
						value={customImage}
						required />
					<label for="is-custom">
						<input
							type="checkbox"
							name="useFileThumbnail"
							id="is-custom"
							bind:checked={useCustomImage}
							disabled={product.fileThumbnail === undefined} />
						Custom
					</label>
				</div>
				<div class="flex grow flex-col gap-2 overflow-hidden sm:overflow-visible">
					<div class="contents">
						<input
							type="text"
							placeholder="Nombre"
							class="w-full bg-input/30 text-xl font-bold"
							name="name"
							value={product.name}
							autocomplete="off"
							required />
						<textarea
							placeholder="Breve descripción del producto"
							class="line-clamp-2 h-[2lh] resize-none bg-input/30 text-wrap whitespace-break-spaces"
							name="description"
							autocomplete="off"></textarea>
					</div>
					<p class="sm:text-md flex gap-2 text-sm text-nowrap">
						<span class="flex items-center gap-0.5">
							<Layers2 size="1em" />
							{Object.values(product.plates).length}
						</span>
						<span class="flex items-center gap-0.5">
							<Clock size="1em" />
							<input
								class="max-w-[2ch] [appearance:textfield] bg-input/30 text-right"
								placeholder="00"
								type="number"
								min={timeSeconds == 0 ? 1 : 0}
								bind:value={timeHours}
								required />
							h

							<input
								class="max-w-[2ch] [appearance:textfield] bg-input/30 text-right"
								placeholder="00"
								type="number"
								min={timeHours == 0 ? 1 : 0}
								max="59"
								bind:value={timeMinutes} />
							m

							<input type="number" bind:value={timeSeconds} name="timeSeconds" hidden />
						</span>
						<span class="flex items-center gap-0.5">
							<Weight size="1em" />
							<input
								class="max-w-[6ch] [appearance:textfield] bg-input/30 text-right"
								placeholder={totalWeightGrams.toFixed(2)}
								min={totalWeightGrams == 0 ? 1 : 0}
								step="0.01"
								type="number"
								name="weightGrams"
								required={Object.values(product.plates).some((plate) => !plate.weightGrams)} />
							g
						</span>
					</p>
				</div>
			</div>
			<div>
				<span class="flex max-w-[5em] items-start gap-2 text-3xl font-bold">
					$<input
						type="number"
						class="w-full [appearance:textfield] bg-input/30"
						name="price"
						min="0"
						step="0.01"
						placeholder="0.00" />
				</span>
				<p class="block text-xs text-muted-foreground italic">(precio estático)</p>
			</div>
		</section>
		<section
			class="grid grid-cols-[repeat(auto-fill,400px)] justify-evenly gap-2 overflow-hidden p-2">
			{#each Object.keys(product.plates) as key}
				<CreatePlate {key} bind:plate={product.plates[key]} />
			{/each}
		</section>
		<div class="flex justify-end gap-2">
			<!-- TODO: confirm before cancel -->
			<Button variant="destructive" onclick={() => (product = undefined)}>Cancelar</Button>
			<Button type="submit">Crear</Button>
		</div>
	{/if}
</form>
