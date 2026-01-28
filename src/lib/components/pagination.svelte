<script lang="ts">
	import * as Pagination from '$lib/components/ui/pagination';
	import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-svelte';
	import { Pagination as PaginationPrimitive } from 'bits-ui';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';

	let props: Omit<PaginationPrimitive.RootProps, 'page'> = $props();

	const getPage = () => Number(page.url.searchParams.get('page')) || 1;

	const setPage = (pageNum: number) => {
		const url = new URL(page.url);
		if (pageNum !== 1) url.searchParams.set('page', pageNum.toString());
		else url.searchParams.delete('page');
		goto(url, { replaceState: true, keepFocus: true, noScroll: true });
	};
</script>

<Pagination.Root bind:page={getPage, setPage} {...props}>
	{#snippet children({ pages, currentPage })}
		<Pagination.Content>
			<Pagination.PrevButton>
				<ChevronLeftIcon />
			</Pagination.PrevButton>
			{#each pages as page (page.key)}
				<Pagination.Item>
					{#if page.type === 'ellipsis'}
						<Pagination.Ellipsis />
					{:else}
						<Pagination.Link {page} isActive={currentPage === page.value}>
							{page.value}
						</Pagination.Link>
					{/if}
				</Pagination.Item>
			{/each}
			<Pagination.NextButton>
				<ChevronRightIcon />
			</Pagination.NextButton>
		</Pagination.Content>
	{/snippet}
</Pagination.Root>
