<script lang="ts">
	type Props = {
		name: string;
		alt?: string;
		value?: File;
		class?: string;
		required?: boolean;
	};

	let { name, alt, value = $bindable(), class: className, required }: Props = $props();

	let files = $state<FileList>();
	let src = $state<string>('');

	$effect(() => {
		if (!value) return;
		src = URL.createObjectURL(value);
		return () => URL.revokeObjectURL(src);
	});

	$effect(() => {
		const data = new DataTransfer();
		if (value) data.items.add(value);
		files = data.files;
	});
</script>

<div class={className}>
	<img {src} class="w-full object-cover" {alt} />
	<input type="file" {name} bind:files hidden {required} />
</div>
