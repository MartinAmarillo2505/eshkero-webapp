<script lang="ts">
	import type { HTMLImgAttributes } from 'svelte/elements';

	type Props = { src?: Blob } & Omit<HTMLImgAttributes, 'src'>;

	let { src: blob = $bindable(), ...props }: Props = $props();
	let src = $state<string>('');

	$effect(() => {
		if (!blob) return;
		src = URL.createObjectURL(blob);
		return () => URL.revokeObjectURL(src);
	});
</script>

<img {src} {...props} />
