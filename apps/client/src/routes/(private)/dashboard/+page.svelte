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
	import moment from 'moment';
	import { onMount } from 'svelte';

	let selectedDoc: Record<string, any>;
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
				{#if data}
					{#each data as row (row.id)}
						<TableBodyRow>
							<TableBodyCell>
								<button on:click={() => (selectedDoc = row)}>
									{row.name}
								</button>
							</TableBodyCell>
							<TableBodyCell class="text-gray-500"
								>{moment(row.createdAt).format('DD MMM YYYY')}</TableBodyCell
							>
							<TableBodyCell
								>{row.invitees.length === row.signatures.length
									? moment(row.updatedAt).format('DD MMM YYYY')
									: 'Not Completed'}</TableBodyCell
							>
							<TableBodyCell
								><Badge color={row.invitees.length === row.signatures.length ? 'green' : 'red'}
									>{row.invitees.length === row.signatures.length ? 'Complete' : 'Pending'}</Badge
								></TableBodyCell
							>
							<TableBodyCell>
								<button
									class="text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300"
								>
									<DotsHorizontalOutline class="h-5 w-5 text-gray-800 dark:text-white" />
									<Dropdown class="py-2">
										<DropdownItem on:click={() => goto(`/new-document?id=${row.id}`)}
											>View Document</DropdownItem
										>
									</Dropdown>
								</button>
							</TableBodyCell>
						</TableBodyRow>
					{/each}
				{:else}
					<TableBodyCell colspan={5}>
						<div class="flex w-full flex-col items-center gap-4 px-10 py-[22px]">
							<ExclamationCircleSolid class="h-[100px] w-[100px] dark:text-gray-700"
							></ExclamationCircleSolid>
							<p>You don't have any document yet. Create your first Document.</p>
						</div>
					</TableBodyCell>
				{/if}
			</TableBody>
		</Table>
	</Card>
	<div>
		<DocPreviewBar>
			{#if selectedDoc}
				<div class="flex flex-col h-full justify-between">
					<div class="flex flex-col gap-4">
						<div class="flex items-center justify-between">
							<h1 class="font-bold text-2xl dark:text-white">Document Name</h1>
							<div class="cursor-pointer">
								<CloseButton on:click={() => (selectedDoc = '')} class=" dark:text-white" />
							</div>
						</div>
						<div class="flex flex-col gap-5">
							<div class="flex flex-col">
								<h3 class="font-sm font-semibold text-gray-700 dark:text-gray-400">
									Document Name
								</h3>
								<p>{selectedDoc.name ?? 'My New Document'}</p>
							</div>
							<div class="flex flex-col">
								<h3 class="font-sm font-semibold text-gray-700 dark:text-gray-400">Date Created</h3>
								<p>{moment(selectedDoc.createdAt).format('DD MMM YYYY')}</p>
							</div>
							<div class="flex flex-col">
								<h3 class="font-sm font-semibold text-gray-700 dark:text-gray-400">
									Date Completed
								</h3>
								<p>
									{selectedDoc.invitees.length === selectedDoc.signatures.length
										? moment(selectedDoc.updatedAt).format('DD MMM YYYY')
										: 'Not Completed'}
								</p>
							</div>
							<div class="flex flex-col">
								<h3 class="font-sm font-semibold text-gray-700 dark:text-gray-400">
									Signing Parties
								</h3>
								{#each selectedDoc.invitees as party}
									<div class="flex items-center gap-3">
										{#if selectedDoc.signatures.includes(party)}
											<CheckCircleSolid class="text-brand-green_dark"></CheckCircleSolid>
										{:else}
											<ExclamationCircleSolid class="text-brand-yellow"></ExclamationCircleSolid>
										{/if}
										{party}
									</div>
								{/each}
							</div>
							<div>
								<h3 class="font-sm font-semibold text-gray-700 dark:text-gray-400">PDF File</h3>
								<div>{selectedDoc.files[0]}</div>
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
