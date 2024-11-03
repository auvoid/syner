<script lang="ts">
	import { goto } from '$app/navigation';
	import { apiClient } from '$lib/axios/axios';
	import DocPreviewBar from '$lib/components/fragments/DocPreviewBar.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Loading from '$lib/components/ui/Loading.svelte';
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

	let loading = true;
	let selectedDoc: Record<string, any>;
	let data: Record<string, any>[];

	onMount(async () => {
		const response = (await apiClient.get('/container')) as AxiosResponse;
		data = response.data;
		loading = false;
	});

	$: emailSignatures = selectedDoc ? selectedDoc.signatures.map((s) => s.email) : [];
</script>

<main class="flex gap-5">
	<Card padding="sm" class="max-w-full overflow-x-hidden shadow-xl h-[calc(100vh-130px)]">
		{#if loading}
			<Loading></Loading>
		{:else}
			<Table divClass="w-full" striped>
				<TableHead class="text-gray-500 bg-gray-100">
					<TableHeadCell>Document Name</TableHeadCell>
					<TableHeadCell>Date Created</TableHeadCell>
					<TableHeadCell>Date Completed</TableHeadCell>
					<TableHeadCell>Status</TableHeadCell>
					<TableHeadCell></TableHeadCell>
				</TableHead>
				<TableBody>
					{#if data.length > 0}
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
									>{row.invitees.length + 1 === row.signatures.length
										? moment(row.updatedAt).format('DD MMM YYYY')
										: 'Not Completed'}</TableBodyCell
								>
								<TableBodyCell
									><Badge
										color={row.invitees.length + 1 === row.signatures.length ? 'green' : 'red'}
										>{row.invitees.length + 1 === row.signatures.length
											? 'Complete'
											: 'Pending'}</Badge
									></TableBodyCell
								>
								<TableBodyCell>
									<button class="text-primary-500 hover:text-primary-600">
										<DotsHorizontalOutline class="h-5 w-5 text-gray-800" />
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
								<ExclamationCircleSolid class="h-[100px] w-[100px]"></ExclamationCircleSolid>
								<p>You don't have any document yet. Create your first Document.</p>
							</div>
						</TableBodyCell>
					{/if}
				</TableBody>
			</Table>
		{/if}
	</Card>
	<div>
		<DocPreviewBar>
			{#if selectedDoc}
				<div class="flex flex-col h-full justify-between">
					<div class="flex flex-col gap-4">
						<div class="flex items-center justify-between">
							<h1 class="font-bold text-2xl">Document Name</h1>
							<div class="cursor-pointer">
								<CloseButton on:click={() => (selectedDoc = '')} />
							</div>
						</div>
						<div class="flex flex-col gap-5">
							<div class="flex flex-col">
								<h3 class="font-sm font-semibold text-gray-700">Document Name</h3>
								<p>{selectedDoc.name ?? 'My New Document'}</p>
							</div>
							<div class="flex flex-col">
								<h3 class="font-sm font-semibold text-gray-700">Date Created</h3>
								<p>{moment(selectedDoc.createdAt).format('DD MMM YYYY')}</p>
							</div>
							<div class="flex flex-col">
								<h3 class="font-sm font-semibold text-gray-700">Date Completed</h3>
								<p>
									{selectedDoc.invitees.length + 1 === selectedDoc.signatures.length
										? moment(selectedDoc.updatedAt).format('DD MMM YYYY')
										: 'Not Completed'}
								</p>
							</div>
							<div class="flex flex-col">
								<h3 class="font-sm font-semibold text-gray-700">Signing Parties</h3>
								{#each selectedDoc.invitees as party}
									<div class="flex items-center gap-3">
										{#if emailSignatures.includes(party)}
											<CheckCircleSolid class="text-brand-yellow"></CheckCircleSolid>
										{:else}
											<ExclamationCircleSolid class="text-red-400"></ExclamationCircleSolid>
										{/if}
										{party}
									</div>
								{/each}
							</div>
						</div>
					</div>
					<div class="flex gap-4 w-full">
						<Button
							buttonClass="w-full"
							color="yellow"
							on:click={() => goto(`/new-document?id=${selectedDoc.id}`)}>View Document</Button
						>
					</div>
				</div>
			{:else}
				<p class="w-full py-8 text-center">Please Select a Document to view</p>
			{/if}
		</DocPreviewBar>
	</div>
</main>
