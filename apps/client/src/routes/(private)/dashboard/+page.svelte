<script lang="ts">
	import { goto } from '$app/navigation';
	import { apiClient } from '$lib/axios/axios';
	import DocPreviewBar from '$lib/components/fragments/DocPreviewBar.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import type { AxiosResponse } from 'axios';
	import {
		Card,
		CloseButton,
		Dropdown,
		DropdownItem,
		Li,
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell
	} from 'flowbite-svelte';
	import {
		CheckCircleSolid,
		DotsHorizontalOutline,
		ExclamationCircleSolid
	} from 'flowbite-svelte-icons';
	import { onMount } from 'svelte';

	let selectedDoc: boolean;
	let docName: string;
	let signingParties: string[];
	let emailContent: string;
	let isSigned: boolean;
	let data: Record<string, any>[];

	onMount(async () => {
		const response = (await apiClient.get('/container')) as AxiosResponse;
		data = response.data;
	});
</script>

<main class="flex gap-5">
	<Card padding="sm" class="max-w-full overflow-x-hidden shadow-xl h-[calc(100vh-130px)]">
		<Table divClass="w-full" striped>
			<TableHead class="text-gray-500 bg-gray-100">
				<TableHeadCell>Document Name</TableHeadCell>
				<TableHeadCell>Date Created</TableHeadCell>
				<TableHeadCell>Date Completed</TableHeadCell>
				<TableHeadCell>Status</TableHeadCell>
				<TableHeadCell></TableHeadCell>
			</TableHead>
			<TableBody>
				{#each data as row (row.id)}
					<TableBodyRow>
						<TableBodyCell>{row.name}</TableBodyCell>
						<TableBodyCell class="text-gray-500">{row.createdAt}</TableBodyCell>
						<TableBodyCell>Not Completed</TableBodyCell>
						<TableBodyCell
							><Badge color="green">{row.invitees.length + 1 === row.signatures.length}</Badge
							></TableBodyCell
						>
						<TableBodyCell>
							<button
								class="text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300"
							>
								<DotsHorizontalOutline class="h-5 w-5 text-gray-800 dark:text-white" />
								<Dropdown class="py-2">
									<DropdownItem on:click={() => goto(`/new-document?id=${row.id}`)}>View Document</DropdownItem>
								</Dropdown>
							</button>
						</TableBodyCell>
					</TableBodyRow>
				{/each}
			</TableBody>
		</Table>
	</Card>

	<div>
		<DocPreviewBar>
			{#if !selectedDoc}
				<div class="flex flex-col h-full justify-between mr-14">
					<div class="flex flex-col gap-4">
						<div class="flex items-center justify-between">
							<h1 class="font-bold text-2xl dark:text-white">Document Name</h1>
							<div class="cursor-pointer">
								<!-- <CloseButton on:click={() => selectedDoc === ''} class=" dark:text-white" /> -->
								<CloseButton class=" dark:text-white" />
							</div>
						</div>
						<div class="flex flex-col gap-5">
							<div class="flex flex-col">
								<h3 class="font-sm font-semibold text-gray-700 dark:text-gray-400">
									Document Name
								</h3>
								<p>{docName ?? 'My New Document'}</p>
							</div>
							<div class="flex flex-col">
								<h3 class="font-sm font-semibold text-gray-700 dark:text-gray-400">Date Created</h3>
								<p>02/09/2023</p>
							</div>
							<div class="flex flex-col">
								<h3 class="font-sm font-semibold text-gray-700 dark:text-gray-400">
									Date Completed
								</h3>
								<p>12/09/2023</p>
							</div>
							<div class="flex flex-col">
								<h3 class="font-sm font-semibold text-gray-700 dark:text-gray-400">
									Signing Parties
								</h3>
								<!-- {#each signingParties as party} -->
								<div class="flex items-center gap-3">
									{#if isSigned}
										<CheckCircleSolid class="text-brand-green_dark"></CheckCircleSolid>
									{:else}
										<ExclamationCircleSolid class="text-brand-yellow"></ExclamationCircleSolid>
									{/if}
									{'Ananya Rana'}
								</div>
								<!-- {/each} -->
							</div>
							<div>
								<h3 class="font-sm font-semibold text-gray-700 dark:text-gray-400">PDF File</h3>
								<div>MyPdfFile.pdf (file displayed and on click opens on screen)</div>
							</div>
							<div></div>
						</div>
					</div>
					<div class="flex gap-4 w-full">
						<Button buttonClass="w-full" color="white">Delete Document</Button>
						<Button buttonClass="w-full" color="yellow">View Document</Button>
					</div>
				</div>
			{:else}
				<p class="w-full py-8 text-center">Please Select a Document to view</p>
			{/if}
		</DocPreviewBar>
	</div>
</main>
