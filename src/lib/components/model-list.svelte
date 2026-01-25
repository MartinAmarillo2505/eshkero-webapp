<script lang="ts">
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import { formatTime } from '$lib/utils';
	import { Clock, Layers2, Weight } from 'lucide-svelte';

	type Props = {
		productId: string;
		models: {
			id: string;
			versionName: string;
			versionNotes: string;
			thumbnailSha1: string;
			createdAt: Date;

			plateCount: number;
			timeSeconds: number;
			weightGrams: number;
		}[];
	};

	let { productId, models }: Props = $props();
</script>

<section class="rounded bg-secondary p-2">
	<h1 class="text-xl font-bold">Modelos</h1>
	<div class="grid auto-rows-fr gap-4 rounded bg-primary-foreground p-2">
		{#each models as model}
			<article class="flex flex-nowrap gap-2">
				<div class="min-w-1 rounded bg-green-500"></div>
				<picture class="flex items-center">
					<img
						class="aspect-square w-24 min-w-24 rounded object-cover"
						src={`/uploads/${model.thumbnailSha1}`}
						loading="lazy"
						alt={`Imagen del modelo ${model.versionName}`} />
				</picture>
				<div class="flex grow flex-col justify-between gap-1">
					<div class="line-clamp-4">
						<h3 class="font-bold">
							<a href={`/products/${productId}/${model.id}`} class="hover:underline"
								>{model.versionName}</a>
						</h3>
						<p class="text-sm whitespace-break-spaces text-secondary-foreground">
							{model.versionNotes}
						</p>
					</div>
					<p class="flex gap-2 text-xs text-nowrap sm:text-sm">
						<span class="flex items-center gap-0.5">
							<Layers2 size="1em" />
							{model.plateCount}
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
