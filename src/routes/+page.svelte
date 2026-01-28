<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Store, FileBox, Layers2 } from 'lucide-svelte';

	const { data } = $props();
</script>

<h1 class="text-center text-2xl font-bold">Administrador de productos y modelos 3D</h1>
<section class="grid grid-cols-3 gap-2 p-2">
	<article class="flex items-center gap-4 rounded-xl bg-secondary p-2">
		<Store size={48} />
		<div>
			<p>Productos</p>
			<p class="text-4xl">{data.products}</p>
		</div>
	</article>
	<article class="flex items-center gap-4 rounded-xl bg-secondary p-2">
		<FileBox size={48} />
		<div>
			<p>Modelos</p>
			<p class="text-4xl">{data.models}</p>
		</div>
	</article>
	<article class="flex items-center gap-4 rounded-xl bg-secondary p-2">
		<Layers2 size={48} />
		<div>
			<p>Placas</p>
			<p class="text-4xl">{data.plates}</p>
		</div>
	</article>
</section>

<section class="flex justify-center p-2">
	<Button class="px-4" href="/products">Buscar productos</Button>
</section>
