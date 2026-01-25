<script lang="ts">
	import CreateProduct from '$lib/components/create-product.svelte';
	import ProductCard from '$lib/components/product-card.svelte';
	import SearchBar from '$lib/components/search-bar.svelte';

	const { data } = $props();
</script>

<CreateProduct />

<SearchBar placeholder="Buscar productos..." results={data.products.length} />
<section
	class="mx-auto grid w-full max-w-300 grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-x-2 gap-y-4">
	{#each data.products as product}
		<ProductCard {...product} />
	{/each}
</section>
