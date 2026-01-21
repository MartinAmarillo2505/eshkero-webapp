<script lang="ts">
	import ModelList from '$lib/components/model-list.svelte';
	import PlateCarousel from '$lib/components/plate-carousel.svelte';
	import ProductHeader from '$lib/components/product-header.svelte';

	const { data } = $props();
	const product = $derived(data.product);
	const plates = $derived(data.plates);
	const models = $derived(data.models);

	const timeSeconds = $derived(plates.reduce((acc, plate) => acc + plate.timeSeconds, 0));
	const weightGrams = $derived(plates.reduce((acc, plate) => acc + plate.weightGrams, 0));
</script>

<ProductHeader {...product} plateCount={plates.length} {timeSeconds} {weightGrams} />
<PlateCarousel {plates} />
<ModelList {models} />
