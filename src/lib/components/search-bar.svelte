<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { LoaderCircle, Search } from 'lucide-svelte';
	import debounce from 'debounce';
	import * as InputGroup from '$lib/components/ui/input-group';

	let { placeholder, results }: { placeholder: string; results: number } = $props();

	let query = $state(page.url.searchParams.get('q') ?? '');
	let loading = $state(false);

	const updateUrl = debounce((query: string) => {
		const url = new URL(page.url);
		if (query) url.searchParams.set('q', query);
		else url.searchParams.delete('q');

		goto(url, { replaceState: true, keepFocus: true, noScroll: true });
		loading = false;
	}, 200);

	$effect(() => {
		loading = true;
		updateUrl(query);
		return () => updateUrl.clear();
	});
</script>

<section class="mx-auto mb-2 max-w-2xl">
	<InputGroup.Root>
		<InputGroup.Input {placeholder} bind:value={query} />
		<InputGroup.Addon>
			<Search />
		</InputGroup.Addon>
		<InputGroup.Addon align="inline-end">
			{#if query}
				{results} resultados
			{/if}
			{#if loading}
				<LoaderCircle class="animate-spin" />
			{/if}
		</InputGroup.Addon>
	</InputGroup.Root>
</section>
