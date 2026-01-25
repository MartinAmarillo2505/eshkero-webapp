<script lang="ts">
	import ModelList from '$lib/components/model-list.svelte';
	import PlateCarousel from '$lib/components/plate-carousel.svelte';
	import ProductHeader from '$lib/components/product-header.svelte';
	import { page } from '$app/state';

	const { data } = $props();
	const product = $derived(data.product);
	const plates = $derived(data.plates);
	const models = $derived(data.models);

	const latestModel = $derived(!page.params.modelId || page.params.modelId === models.at(0)?.id);
</script>

<ProductHeader {...product} {latestModel} />
<PlateCarousel {plates} />
<ModelList productId={product.id} {models} />
