<script lang="ts">
	import { page } from '$app/state';
	const pathname = $derived(page.url.pathname);

	const navLinks = [{ href: '/products', label: 'Productos' }];
</script>

<header class="sticky top-0 z-50 flex items-center justify-between border-b bg-background p-4">
	<a class="text-2xl font-bold" href="/">Eshkero 3D</a>
	<nav class="flex items-center gap-4">
		{#each navLinks as { href, label }}
			<a
				data-sveltekit-preload-data="hover"
				{href}
				class="[&.active]:font-bold"
				class:active={pathname.startsWith(href)}>{label}</a>
		{/each}
	</nav>
</header>
