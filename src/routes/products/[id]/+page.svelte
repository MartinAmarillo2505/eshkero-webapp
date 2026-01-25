<script lang="ts">
	import ModelList from '$lib/components/model-list.svelte';
	import PlateCarousel from '$lib/components/plate-carousel.svelte';
	import ProductHeader from '$lib/components/product-header.svelte';

	const { data } = $props();
	const product = $derived(data.product);
	const plates = $derived(data.plates);
	const models = $derived(data.models);
</script>

<ProductHeader {...product} />
<PlateCarousel {plates} />
<ModelList {models} />
