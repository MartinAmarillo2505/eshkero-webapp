<script lang="ts">
	import { formatTime } from '$lib/utils';
	import { Box, Clock, Weight } from 'lucide-svelte';

	type Props = {
		plates: {
			id: string;
			name: string;
			thumbnailSha1: string;
			filaments: { color: string; type: string }[];
			objects: number;
			timeSeconds: number;
			weightGrams: number;
		}[];
	};

	let { plates }: Props = $props();
</script>

<section class="mb-2 rounded bg-secondary p-2">
	<h1 class="text-xl font-bold">Placas</h1>
	<section class="flex min-h-44 gap-4 overflow-x-auto rounded bg-primary-foreground p-2">
		{#if plates.length === 0}
			<p class="flex grow items-center justify-around">No hay placas</p>
		{/if}
		{#each plates as plate, index}
			<article class="flex w-32 basis-auto flex-col justify-between gap-1">
				<div>
					<img
						class="aspect-square w-32 rounded object-cover"
						src={`/uploads/${plate.thumbnailSha1}`}
						loading="lazy"
						alt={`Imagen de la placa ${plate.name || `Placa ${index + 1}`}`} />
					<p class="line-clamp-2 font-bold" title={plate.name || `Placa ${index + 1}`}>
						{plate.name || `Placa ${index + 1}`}
					</p>
				</div>
				<div class="flex gap-1">
					{#each plate.filaments as { color, type }}
						<div
							class="h-4 w-4 border border-white"
							style="background-color: {color}"
							title={`Filamento ${type}`}>
						</div>
					{/each}
				</div>
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
			</article>
		{/each}
	</section>
</section>
