<script lang="ts">
	import Loading from '$lib/components/ui/Loading.svelte';
	import { Card } from 'flowbite-svelte';

	export let pdfFile: FileList | undefined;
	export let docUrl: string;

	// Create a function to get the URL of the first file
	const getPdfUrl = () => {
		if (!!docUrl) return docUrl;
		if (pdfFile && pdfFile.length > 0) {
			docUrl = URL.createObjectURL(pdfFile[0]);
		}
		return '';
	};

	$: pdfFile && getPdfUrl();
</script>

<main class="w-full flex gap-5">
	<div class="w-full flex gap-5">
		<Card class="shadow-xl max-w-full h-[calc(100vh-130px)] flex flex-col gap-1">
			<h1 class="text-3xl font-bold text-gray-700 mb-1.5">Document Preview</h1>
			{#if docUrl}
				<div class="h-full w-full">
					<div class="rounded h-full w-full overflow-hidden">
						<embed src={docUrl} width="100%" height="100%" type="application/pdf" />
					</div>
				</div>
			{:else}
				<Loading></Loading>
			{/if}
		</Card>
	</div>
</main>
