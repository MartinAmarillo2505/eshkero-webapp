<script lang="ts">
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import { Button } from '$lib/components/ui/button';
	import { formatTime } from '$lib/utils';
	import { Box, Clock, Download, Layers2, SquareArrowOutUpRight, Weight } from 'lucide-svelte';
	import * as Carousel from '$lib/components/ui/carousel';

	const { data } = $props();
	const product = $derived(data.product);
	const plates = $derived(data.plates);
	const models = $derived(data.models);

	const timeSeconds = $derived(plates.reduce((acc, plate) => acc + plate.timeSeconds, 0));
	const weightGrams = $derived(plates.reduce((acc, plate) => acc + plate.weightGrams, 0));
</script>

<section class="mb-2 flex flex-wrap gap-2 rounded bg-secondary p-2">
	<div class="flex grow gap-2">
		<img
			src="https://placehold.co/500x500/png"
			class="aspect-square w-32 rounded object-cover"
			alt={`Imagen del producto ${product.name}`} />
		<div class="flex flex-col justify-between gap-2">
			<div>
				<h1 class="text-xl font-bold">{product.name}</h1>
				<p class="line-clamp-2 text-wrap whitespace-break-spaces">{product.description}</p>
			</div>
			<div>
				<div class="mb-2 flex h-[1em] gap-1">
					{#each product.categories as category}
						<Badge variant="outline">{category}</Badge>
					{/each}
				</div>
				<p class="flex gap-2 text-sm text-nowrap">
					<span class="flex items-center gap-0.5">
						<Layers2 size="1em" />
						{plates.length} <span class="hidden sm:inline">placa(s)</span>
					</span>
					<span class="flex items-center gap-0.5">
						<Clock size="1em" />
						{formatTime(timeSeconds)}
					</span>
					<span class="flex items-center gap-0.5">
						<Weight size="1em" />
						{weightGrams}g
					</span>
				</p>
			</div>
		</div>
	</div>
	<div
		class="flex w-full flex-row-reverse items-center justify-between gap-2 sm:w-auto sm:flex-col sm:items-end">
		<p class="p-2 text-3xl font-bold">${product.price.toFixed(2)}</p>
		<div class="flex gap-1 text-xs">
			<Button class="cursor-pointer">
				<SquareArrowOutUpRight size="1em" />
				<span class="hidden sm:block"> Abrir</span>
			</Button>
			<Button class="cursor-pointer">
				<Download size="1em" />
				<span class="hidden sm:block"> Descargar</span>
			</Button>
		</div>
	</div>
</section>

<section class="mb-2 rounded bg-secondary p-2">
	<h1 class="text-xl font-bold">Placas</h1>
	<Carousel.Root class="rounded bg-primary-foreground p-2">
		<Carousel.Content>
			{#each plates as plate}
				<Carousel.Item class="basis-auto">
					<img
						class="aspect-square w-32 rounded object-cover"
						src="https://placehold.co/500x500/png"
						alt={`Imagen de la placa ${plate.name}`} />
					<p class="font-bold">{plate.name}</p>
					<p class="flex gap-2 text-xs text-nowrap">
						<span class="flex items-center gap-0.5">
							<Box size="1em" />
							{plate.objects}
						</span>
						<span class="flex items-center gap-0.5">
							<Clock size="1em" />
							{formatTime(plate.timeSeconds)}
						</span>
						<span class="flex items-center gap-0.5">
							<Weight size="1em" />
							{plate.weightGrams}g
						</span>
					</p>
				</Carousel.Item>
			{/each}
		</Carousel.Content>
	</Carousel.Root>
</section>

<section class="rounded bg-secondary p-2">
	<h1 class="text-xl font-bold">Modelos</h1>
	<div class="grid auto-rows-fr gap-4 rounded bg-primary-foreground p-2">
		{#each models as model}
			<article class="flex flex-nowrap gap-2">
				<div class="min-w-1 rounded bg-green-500"></div>
				<picture class="flex items-center">
					<img
						class="aspect-square w-24 min-w-24 rounded object-cover"
						src="https://placehold.co/500x500/png"
						alt={`Imagen del modelo ${model.versionName}`} />
				</picture>
				<div class="flex grow flex-col justify-between gap-1">
					<div class="line-clamp-4">
						<h3 class="font-bold">{model.versionName}</h3>
						<p class="text-sm whitespace-break-spaces text-secondary-foreground">
							{model.versionNotes}
						</p>
					</div>
					<p class="flex gap-2 text-xs text-nowrap sm:text-sm">
						<span class="flex items-center gap-0.5">
							<Layers2 size="1em" />
							{model.plates.length}
						</span>
						<span class="flex items-center gap-0.5">
							<Clock size="1em" />
							{formatTime(model.timeSeconds)}
						</span>
						<span class="flex items-center gap-0.5">
							<Weight size="1em" />
							{model.weightGrams}g
						</span>
					</p>
				</div>
				<div class="hidden shrink flex-col items-end justify-between sm:flex">
					<p class="text-gray-400">{model.createdAt.toLocaleDateString()}</p>
					<p>
						{#if models[0].id === model.id}
							<Badge variant="outline" class="border-green-500 text-green-500">Actual</Badge>
						{/if}
					</p>
				</div>
			</article>
		{/each}
	</div>
</section>
