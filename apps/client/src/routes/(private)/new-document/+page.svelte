<script lang="ts">
	import DocPreviewBar from '$lib/components/fragments/DocPreviewBar.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { Card, Li, Modal } from 'flowbite-svelte';
	import Step1 from './steps/step1.svelte';
	import Step2 from './steps/step2.svelte';
	import { ChevronLeftOutline, CheckCircleSolid } from 'flowbite-svelte-icons';
	import { goto } from '$app/navigation';
	import { apiClient } from '$lib/axios/axios';
	import type { AxiosResponse } from 'axios';
	import { addToast } from '../../store';
	import Qr from '$lib/components/ui/Qr.svelte';
	import { createWebsocket } from '$lib/utils/websocket';
	import { onMount } from 'svelte';
	import { PUBLIC_VERIFF_KEY } from '$env/static/public';
	import { page } from '$app/stores';
	import {
		type EmbeddedOptions,
		MESSAGES,
		type VeriffFrameOptions,
		createVeriffFrame
	} from '@veriff/incontext-sdk';
	import Loading from '$lib/components/ui/Loading.svelte';

	let step = 0;
	let docName: string;
	let signingParties: string[] = [];
	let emailContent: string;
	let showSendEmailModal: boolean = false;
	let showSignModal: boolean = false;
	let containerId: string;
	let qr: string;
	let requestIdVerificaiton = true;
	let editingView = false;
	let docUrl: string;
	let signedAlready = false;
	let signatures: string[] = [];
	let pdfFile: FileList;
	let uploadedPdfId: string;
	let fileName: undefined | string;
	let loading = false;

	function handleGoBack() {
		if (step === 0 || !signedAlready) {
			goto('/dashboard');
		} else {
			step--;
		}
	}

	async function handleContinue() {
		if (step === 0) {
			if (!(signingParties.length > 0) || !(pdfFile.length > 0)) {
				addToast({
					type: 'error',
					message: 'Fill signer fields and pdf please'
				});
				return;
			}
			showSendEmailModal = true;
		} else if (step === 1) {
			const {
				data: { user }
			} = await apiClient.get('/users/session');
			if (!user.verified) {
				return (showSignModal = true);
			}
			requestIdVerificaiton = false;
			const { data } = await apiClient.post(`/oid4vc/signature-session`, { containerId });
			qr = data.uri;

			showSignModal = true;
		}
	}

	async function verifyUser() {
		const {
			data: { verification }
		} = await apiClient.get('/users/idv');
		createVeriffFrame({
			url: verification.url,
			onEvent: function (msg: MESSAGES) {
				switch (msg) {
					case MESSAGES.STARTED:
						console.log('Verification started');
						break;
					case MESSAGES.SUBMITTED:
						console.log('Verification submitted');
						break;
					case MESSAGES.FINISHED:
						console.log('Verification finished');
						break;
					case MESSAGES.CANCELED:
						console.log('Verification closed');
						break;
					case MESSAGES.RELOAD_REQUEST:
						console.log('Verification reloaded');
						break;
				}
			}
		});
	}

	const uploadPdf = async () => {
		isPdfUploading = true;
		const form = new FormData();
		form.append('pdfFile', pdfFile[0]);
		console.log(form);
		const { data } = (await apiClient.post('/upload/pdf', form).catch((e) => {
			isPdfUploading = false;
			console.error(e);
		})) as AxiosResponse<{ id: string }>;
		isPdfUploading = false;
		uploadedPdfId = data.id;
		console.log(uploadedPdfId);
	};

	const handleSigningSubmit = async () => {
		const { data } = (await apiClient
			.post('/container', {
				fileId: uploadedPdfId,
				invitees: signingParties,
				name: docName
			})
			.catch((e) => {
				console.error(e);
			})) as AxiosResponse<{
			id: string;
			invitees: string[];
			files: Record<string, any>;
			signatures: Record<string, any>;
		}>;
		containerId = data.id;
		showSendEmailModal = false;
		step++;
	};

	onMount(async () => {
		const urlParams = new URLSearchParams($page.url.search);
		const urlContainerId = urlParams.get('id');
		if (urlContainerId) {
			loading = true;
			step = 1;
			const { data } = await apiClient.get(`/container/${urlContainerId}`);
			docName = data.name;
			containerId = data.id;
			signingParties = data.invitees;
			signatures = data.signatures.map((s) => s.email);
			const {
				data: { user }
			} = await apiClient.get('/users/session');
			signedAlready = data.signatures.find((s) => s.email === user.email);
			docUrl = (await apiClient.get(`/upload?cid=${data.files[0].cid}`)).data;
			loading = false;
		}
		const ws = createWebsocket();
		ws.onmessage = async (event) => {
			console.log(event);
			const data = JSON.parse(event.data);
			if (data.container) {
				console.log(data);
				signingComplete = true;
			} else if (data.idVerified) {
				requestIdVerificaiton = false;
			}
		};
	});

	$: signingComplete = false;
	$: isPdfUploading = false;
</script>

<Modal title="Confirm Action" bind:open={showSendEmailModal}>
	<div class="flex flex-col gap-5">
		<div>
			<h1 class="text-lg text-gray-900 font-semibold">
				Are you sure you want to send the doc to the following Signing Parties?
			</h1>
			<p class="text-sm">(Please re-check all the details before sending the document.)</p>
			{#each signingParties as party}
				<div class="text-md text-gray-800">
					<Li>{party}</Li>
				</div>
			{/each}
		</div>
		<div class="flex justify-end">
			<Button color="light-yellow" on:click={() => handleSigningSubmit()}
				>Continue and Send Emails</Button
			>
		</div>
	</div>
</Modal>

<Modal title="Sign Document" bind:open={showSignModal}>
	{#if requestIdVerificaiton}
		<div class="flex flex-col gap-5">
			<div>
				<h1 class="text-lg text-gray-900 font-semibold">
					You need to undergo Identity Verification before you can sign this document
				</h1>
			</div>
			<Button on:click={verifyUser}>Start Verification</Button>
		</div>
	{:else}
		<div class="flex flex-col justify-center items-center">
			{#if signingComplete}
				<CheckCircleSolid color="#F7D57E" class="h-24 w-24" />
				Signed
			{:else}
				<div class="text-lg text-gray-900 font-semibold">
					To sign the document scan the QR with your Identity wallet
				</div>
				<div>
					<Qr data={qr}></Qr>
				</div>
			{/if}
		</div>
	{/if}
</Modal>

<div class="flex gap-5">
	{#if step === 0}
		<Step1
			{isPdfUploading}
			uploadHandler={uploadPdf}
			bind:pdfFile
			bind:docName
			bind:signingParties
			bind:emailContent
			bind:fileName
		/>
	{:else if step === 1}
		<Step2 bind:pdfFile {docUrl} />
	{/if}
	<DocPreviewBar>
		<div class="flex flex-col h-full justify-between">
			{#if loading}
				<Loading></Loading>
			{:else}
				{#if step === 0}
					<div class="flex flex-col gap-5">
						<div class="flex flex-col">
							<h3 class="font-sm font-semibold text-gray-700">Document Name</h3>
							<p>{docName ?? 'My New Document'}</p>
						</div>
						<div class="flex flex-col">
							<h3 class="font-sm font-semibold text-gray-700">Signing Parties</h3>
							{#each signingParties as party}
								<div>
									<Li>{party}</Li>
								</div>
							{/each}
							{#if signingParties.length === 0}
								name@example.com
							{/if}
						</div>
						<div>
							<h3 class="font-sm font-semibold text-gray-700">PDF File</h3>
							<div>{isPdfUploading ? 'PDF is uploading' : fileName ? fileName : 'my-doc.pdf'}</div>
						</div>
						<div>
							<h3 class="font-sm font-semibold text-gray-700">Your Message</h3>
							<p>
								{emailContent ?? 'Message to be sent'}
							</p>
						</div>
					</div>
				{:else if step === 1}
					<div class="flex flex-col gap-3">
						<div class="flex items-center justify-between">
							<h1 class="font-bold text-2xl">Sign Document</h1>
						</div>
						{#if !signedAlready}
							<h1 class="font-bold text-md">
								Please take a look at the document and sign it by clicking the button below
							</h1>
						{/if}
						<Card padding="sm">
							<div class="text-gray-800 font-bold flex justify-between items-center">
								You: {signedAlready || signingComplete ? '✅ Signed' : '🕐 Pending'}
							</div>
						</Card>
						{#each signingParties as invitee (invitee)}
							<Card padding="sm">
								<div class="text-gray-500 font-semibold">
									{`${invitee}: ${signatures.includes(invitee) ? '✅ Signed' : '🕐 Pending'}`}
								</div>
							</Card>
						{/each}
					</div>
				{/if}
				{#if !signedAlready}
					<div class="flex flex-col gap-2">
						<div>
							<!-- svelte-ignore a11y_click_events_have_key_events -->
							<!-- svelte-ignore a11y_no_static_element_interactions -->
							<small class="flex w-full cursor-pointer justify-end" on:click={handleGoBack}
								><ChevronLeftOutline></ChevronLeftOutline>Go Back</small
							>
						</div>
						<div class="flex gap-4 w-full">
							<Button
								buttonClass="w-full"
								color="white"
								on:click={() => {
									goto('/dashboard');
								}}>Cancel</Button
							>
							<Button buttonClass="w-full" color="yellow" on:click={handleContinue}
								>{step === 0 ? 'Continue' : 'Sign'}</Button
							>
						</div>
					</div>
				{/if}
			{/if}
		</div>
	</DocPreviewBar>
</div>
