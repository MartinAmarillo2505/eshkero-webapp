<script lang="ts">
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { formatPrice, formatTime, openFileInBambuStudio } from '$lib/utils';
	import { Clock, Download, Layers2, SquareArrowOutUpRight, Weight } from 'lucide-svelte';
	import { page } from '$app/state';

	type Props = {
		latestModel: boolean;

		id: string;
		name: string;
		description: string;
		thumbnailSha1: string;
		fileSha1: string;
		fileName: string | null;
		categories: string[];
		price: number | null;

		plateCount: number;
		timeSeconds: number;
		weightGrams: number;
	};

	let { latestModel, ...product }: Props = $props();

	const downloadUrl = $derived(
		new URL(`/uploads/${product.fileSha1}/${product.fileName}`, page.url.origin)
	);
	const downloadFile = $derived(() => window.open(downloadUrl, '_self'));
	const openFile = $derived(() => openFileInBambuStudio(downloadUrl));
</script>

<section class="mb-2 flex flex-wrap gap-2 rounded bg-secondary p-2 md:flex-nowrap">
	<div class="flex grow gap-2 overflow-auto">
		<img
			src={`/uploads/${product.thumbnailSha1}`}
			class="aspect-square w-32 rounded object-cover"
			alt={`Imagen del producto ${product.name}`} />
		<div class="flex flex-col justify-between gap-2">
			<div>
				<h1 class="flex items-center gap-2 text-xl font-bold" title={product.name}>
					{product.name}
					{#if latestModel}
						<Badge variant="outline" class="border-green-500 text-green-500">Actual</Badge>
					{:else}
						<Badge variant="outline" class="border-amber-500 text-amber-500">Viejo</Badge>
					{/if}
				</h1>
				<p class="line-clamp-2 text-wrap whitespace-break-spaces" title={product.description}>
					{product.description}
				</p>
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
						{product.plateCount} <span class="hidden sm:inline">placa(s)</span>
					</span>
					<span class="flex items-center gap-0.5">
						<Clock size="1em" />
						{formatTime(product.timeSeconds)}
					</span>
					<span class="flex items-center gap-0.5">
						<Weight size="1em" />
						{product.weightGrams}g
					</span>
				</p>
			</div>
		</div>
	</div>
	<div
		class="flex w-full flex-row-reverse items-center justify-between gap-2 md:w-auto md:flex-col md:items-end">
		<p class="p-2 text-3xl font-bold">${formatPrice(product.price ?? 0)}</p>
		<div class="flex gap-1 text-xs">
			<Button class="cursor-pointer" onclick={openFile}>
				<SquareArrowOutUpRight size="1em" />
				<span class="hidden sm:block"> Abrir</span>
			</Button>
			<Button class="cursor-pointer" onclick={downloadFile}>
				<Download size="1em" />
				<span class="hidden sm:block"> Descargar</span>
			</Button>
		</div>
	</div>
</section>
