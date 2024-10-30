<script lang="ts">
	import { Card } from 'flowbite-svelte';

	export let pdfFile: FileList | undefined;

	// Create a function to get the URL of the first file
	const getPdfUrl = () => {
		if (pdfFile && pdfFile.length > 0) {
			return URL.createObjectURL(pdfFile[0]);
		}
		return '';
	};
</script>

<main class="w-full flex gap-5">
	<div class="w-full flex gap-5">
		<Card class="shadow-xl max-w-full h-[calc(100vh-130px)] flex flex-col gap-1">
			<h1 class="text-3xl font-bold text-gray-700 mb-10">Edit Document Field</h1>
			{#if pdfFile && pdfFile.length > 0}
				<div class="h-full w-full">
					<h1 class="text-2xl font-semibold text-gray-600 mb-10">Document Name</h1>
					<!-- Pdf to be displayed here -->
					<embed src={getPdfUrl()} height="100%" width="100%" type="application/pdf" />
				</div>
			{:else}
				<p>Error occured getting pdf</p>
			{/if}
		</Card>
	</div>
</main>
