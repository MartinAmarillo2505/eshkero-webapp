<script lang="ts">
	import { Clock, Layers2, Weight } from 'lucide-svelte';
	import Badge from './ui/badge/badge.svelte';
	import { formatTime } from '$lib/utils';

	type Props = {
		id: string;
		name: string;
		description: string;
		categories: string[];
		price: number;

		plateCount: number;
		timeSeconds: number;
		weightGrams: number;
	};
	const product: Props = $props();
</script>

<article
	data-sveltekit-preload-data="hover"
	class="flex flex-col justify-between gap-2 rounded bg-secondary p-2 transition-all hover:scale-105 hover:bg-secondary/80">
	<div>
		<a href={`/products/${product.id}`}>
			<img
				src="https://placehold.co/500x500/png"
				class="aspect-square w-full rounded-lg object-cover"
				alt={`Imagen del producto ${product.name}`} />
			<h3 class="line-clamp-1 text-xl font-bold hover:underline">{product.name}</h3>
		</a>
		<p class="line-clamp-2 text-wrap whitespace-break-spaces">{product.description}</p>
	</div>
	<p class="text-lg font-bold">${product.price.toFixed(2)}</p>
	<div>
		<div class="mb-2 flex h-[1em] gap-1">
			{#each product.categories as category}
				<Badge variant="outline">{category}</Badge>
			{/each}
		</div>
		<p class="flex gap-2 text-nowrap sm:text-sm">
			<span class="flex items-center gap-0.5">
				<Layers2 size="1em" />
				{product.plateCount}
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
</article>
