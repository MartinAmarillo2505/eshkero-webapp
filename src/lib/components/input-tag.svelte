<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { Badge } from './ui/badge';
	import { CircleX } from 'lucide-svelte';

	let {
		value = $bindable<string[]>([]),
		placeholder,
		type: _,
		...props
	}: HTMLInputAttributes = $props();

	let textInput = $state('');

	function update(text: string) {
		let newTags = text.split(' ');
		textInput = newTags.pop() ?? '';
		if (newTags.length === 0) return;
		newTags = newTags.filter((tag) => tag.length > 0);
		newTags = [...value, ...newTags].map((tag: string) => tag.toLowerCase().trim());
		value = [...new Set(newTags)];
	}

	function onkeydown(event: KeyboardEvent) {
		if (event.key !== 'Backspace' || textInput.length !== 0) return;
		event.preventDefault();
		const newTags = [...value];
		textInput = newTags.pop();
		value = newTags;
	}

	$effect(() => update(textInput));

	const valueString = $derived(value.join(' '));
</script>

<div class="flex gap-1 overflow-x-auto bg-input/30">
	{#each value as tag, index}
		<Badge variant="outline" class="flex items-center gap-1">
			{tag}
			<button
				onclick={(event) => {
					event.preventDefault();
					const newTags = [...value];
					newTags.splice(index, 1);
					value = newTags;
				}}>
				<CircleX size="1em" />
			</button>
		</Badge>
	{/each}
	<input type="text" class="w-full" {placeholder} {onkeydown} bind:value={textInput} />
	<input type="hidden" {...props} value={valueString} />
</div>
