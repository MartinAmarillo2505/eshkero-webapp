<script lang="ts">
	import * as Carousel from '$lib/components/ui/carousel';
	import { formatTime } from '$lib/utils';
	import { Box, Clock, Weight } from 'lucide-svelte';

	type Props = {
		plates: {
			id: string;
			name: string;
			thumbnailSha1: string;
			objects: number;
			timeSeconds: number;
			weightGrams: number;
		}[];
	};

	let { plates }: Props = $props();
</script>

<section class="mb-2 rounded bg-secondary p-2">
	<h1 class="text-xl font-bold">Placas</h1>
	<Carousel.Root class="rounded bg-primary-foreground p-2">
		<Carousel.Content>
			{#each plates as plate}
				<Carousel.Item class="basis-auto">
					<img
						class="aspect-square w-32 rounded object-cover"
					src={`/uploads/${plate.thumbnailSha1}`}
					loading="lazy"
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
