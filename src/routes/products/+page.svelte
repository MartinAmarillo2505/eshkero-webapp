<script lang="ts">
	import CreateProduct from '$lib/components/create-product.svelte';
	import ProductCard from '$lib/components/product-card.svelte';
	import SearchBar from '$lib/components/search-bar.svelte';
	import Pagination from '$lib/components/pagination.svelte';

	const { data } = $props();
</script>

<svelte:head>
	<title>Productos - Eshkero 3D</title>
</svelte:head>

<section class="mx-auto mb-2 max-w-300">
	<CreateProduct />
	<SearchBar placeholder="Buscar productos..." count={data.count} perPage={data.perPage} />
</section>

<section
	class="mx-auto mb-4 grid w-full max-w-300 grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-x-2 gap-y-4">
	{#each data.products as product}
		<ProductCard {...product} />
	{:else}
		<p class="col-span-full text-center p-4">No se encontraron resultados</p>
	{/each}
</section>

<Pagination count={data.count} perPage={data.perPage} />
