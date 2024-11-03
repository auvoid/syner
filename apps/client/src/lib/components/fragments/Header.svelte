<script lang="ts">
	import { Search } from 'flowbite-svelte';
	import Button from '../ui/Button.svelte';
	import Logo from '../ui/Logo.svelte';
	import { goto } from '$app/navigation';
	export let isPublic = false;
</script>

<header
	class="fixed flex h-16 w-screen justify-between items-center border-b-[1px] gap-3 border-gray-200 bg-white p-2 pl-3 shadow-lg border px-5"
>
	<div class="flex gap-2 items-center">
		<div class="h-full">
			<Logo />
		</div>
		<h1 class="text-2xl font-semibold select-none text-gray-700">Syner</h1>
	</div>
	{#if !isPublic}
		<div class="w-2/5">
			<Search
				class="w-full text-ellipsis rounded-lg py-[12px] focus:border-brand-green focus:ring-brand-green"
				size="md"
			></Search>
		</div>
		<div>
			<Button color="yellow" on on:click={() => goto('/new-document')}>Create New Document</Button>
		</div>
	{/if}
</header>
