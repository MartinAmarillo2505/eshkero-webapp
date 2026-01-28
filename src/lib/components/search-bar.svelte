<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { LoaderCircle, Search } from 'lucide-svelte';
	import debounce from 'debounce';
	import * as InputGroup from '$lib/components/ui/input-group';
	import * as Select from '$lib/components/ui/select';
	import Pagination from './pagination.svelte';

	type Props = { placeholder: string; count: number; perPage: number };
	let { placeholder, count, perPage }: Props = $props();

	const orderByMap = {
		relevance: 'Relevancia',
		createdAt: 'Fecha de creación',
		name: 'Nombre',
		price: 'Precio'
	} as Record<string, string>;

	let query = $state(page.url.searchParams.get('q') ?? '');
	let orderBy = $state(page.url.searchParams.get('orderBy') ?? Object.keys(orderByMap)[0]);
	let limit = $state(page.url.searchParams.get('limit') ?? '10');
	let loading = $state(false);

	const updateUrl = debounce((query: string, limit: string, orderBy: string) => {
		const url = new URL(page.url);
		if (query) url.searchParams.set('q', query);
		else url.searchParams.delete('q');
		if (limit !== '10') url.searchParams.set('limit', limit);
		else url.searchParams.delete('limit');
		if (orderBy !== 'relevance') url.searchParams.set('orderBy', orderBy);
		else url.searchParams.delete('orderBy');

		goto(url, { replaceState: true, keepFocus: true, noScroll: true });
		loading = false;
	}, 200);

	$effect(() => {
		loading = true;
		updateUrl(query, limit, orderBy);
		return () => updateUrl.clear();
	});
</script>

<div>
	<InputGroup.Root>
		<InputGroup.Input {placeholder} bind:value={query} />
		<InputGroup.Addon>
			<Search />
		</InputGroup.Addon>
		<InputGroup.Addon align="inline-end">
			{#if query}
				{count} resultados
			{/if}
			{#if loading}
				<LoaderCircle class="animate-spin" />
			{/if}
		</InputGroup.Addon>
	</InputGroup.Root>

	<div class="mt-2 flex justify-between">
		<div class="flex flex-wrap gap-1">
			<Select.Root type="single" bind:value={orderBy}>
				<Select.Trigger class="grow">
					<span>
						Ordenar por:
						<span class="text-muted-foreground">{orderByMap[orderBy]}</span>
					</span>
				</Select.Trigger>
				<Select.Content>
					{#each Object.entries(orderByMap) as [key, value]}
						<Select.Item value={key}>{value}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>

			<Select.Root type="single" bind:value={limit}>
				<Select.Trigger>Límite: <span class="text-muted-foreground">{limit}</span></Select.Trigger>
				<Select.Content>
					<Select.Item value="5">5</Select.Item>
					<Select.Item value="10">10</Select.Item>
					<Select.Item value="15">15</Select.Item>
					<Select.Item value="20">20</Select.Item>
					<Select.Item value="50">50</Select.Item>
					<Select.Item value="100">100</Select.Item>
				</Select.Content>
			</Select.Root>
		</div>
		<Pagination class="mx-0 hidden w-auto sm:block" {count} {perPage} />
	</div>
</div>
