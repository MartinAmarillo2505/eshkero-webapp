<script lang="ts">
	import { Box, Clock, Weight } from 'lucide-svelte';
	import ImageInput from './image-input.svelte';

	type Props = {
		key: string;
		plate: {
			name: string;
			thumbnail: Promise<File> | undefined;
			objects: number;
			timeSeconds?: number;
			weightGrams?: number;
		};
	};

	let { key, plate = $bindable() }: Props = $props();

	let thumbnail = $state<File>();

	$effect(() => {
		plate.thumbnail?.then((file) => (thumbnail = file));
	});

	let timeHours = $state<number>(0);
	let timeMinutes = $state<number>(0);

	$effect(() => {
		if (plate.timeSeconds === undefined) plate.timeSeconds = 0;
		timeHours = Math.floor(plate.timeSeconds / 3600);
		timeMinutes = Math.floor((plate.timeSeconds % 3600) / 60);
	});

	$effect(() => {
		plate.timeSeconds = (timeHours * 60 + timeMinutes) * 60;
	});
</script>

<article class="flex gap-2">
	<ImageInput
		class="flex aspect-square w-16 shrink-0 grow-0 items-center rounded bg-input/30 object-cover sm:w-24"
		name={`plate[${key}][thumbnail]`}
		bind:value={thumbnail}
		required />
	<div class="flex flex-col justify-between gap-2">
		<input
			type="text"
			placeholder="Nombre de la placa"
			class="bg-input/30 text-xl font-bold"
			name={`plate[${key}][name]`}
			value={plate.name}
			autocomplete="off" />
		<p class="sm:text-md flex gap-2 text-sm text-nowrap">
			<span class="flex items-center gap-0.5">
				<Box size="1em" />
				{plate.objects}
				<input type="text" name={`plate[${key}][objects]`} value={plate.objects} hidden />
			</span>
			<span class="flex items-center gap-0.5">
				<Clock size="1em" />
				<input
					class="max-w-[2ch] [appearance:textfield] bg-input/30 text-right"
					placeholder="00"
					type="number"
					bind:value={timeHours}
					min="0"
					required />
				h

				<input
					class="max-w-[2ch] [appearance:textfield] bg-input/30 text-right"
					placeholder="00"
					type="number"
					bind:value={timeMinutes}
					min="0"
					max="59"
					required />
				m

				<input
					type="number"
					bind:value={plate.timeSeconds}
					name={`plate[${key}][timeSeconds]`}
					hidden />
			</span>
			<span class="flex items-center gap-0.5">
				<Weight size="1em" />
				<input
					class="max-w-[6ch] [appearance:textfield] bg-input/30 text-right"
					placeholder="0.00"
					step="0.01"
					type="number"
					name={`plate[${key}][weightGrams]`}
					bind:value={plate.weightGrams}
					min="0" />
				g
			</span>
		</p>
	</div>
</article>
