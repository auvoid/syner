<script lang="ts">
	import { page } from '$app/stores';
	import { apiClient } from '$lib/axios/axios';
	import Qr from '$lib/components/ui/Qr.svelte';
	import { createWebsocket } from '$lib/utils/websocket';
	import { onMount } from 'svelte';
	import { addToast } from '../../store';
	import {
		type EmbeddedOptions,
		MESSAGES,
		type VeriffFrameOptions,
		createVeriffFrame
	} from '@veriff/incontext-sdk';
	import { PUBLIC_VERIFF_KEY } from '$env/static/public';
	import Button from '$lib/components/ui/Button.svelte';
	import DocPreviewBar from '$lib/components/fragments/DocPreviewBar.svelte';
	import { Card, Li, Modal } from 'flowbite-svelte';
	import Header from '$lib/components/fragments/Header.svelte';

	$: signingComplete = false;
	$: docUrl = '';
	let showSignModal = false;
	let requestIdVerificaiton = true;
	let userEmail: string;

	let qr: string;
	let signingParties: string[];
	let signatures: string[];
	let attemptSignature: () => Promise<void>;
	let containerId: string;
	let accessToken: string;
	let signedAlready = false;

	async function verifyUser() {
		const {
			data: { verification }
		} = await apiClient.get('/users/idv?override=session');
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

	async function handleSignClick() {
		const {
			data: { session }
		} = await apiClient.get('/users/session');
		if (!session.isValid) {
			return (showSignModal = true);
		}
		requestIdVerificaiton = false;
		const { data } = await apiClient.post(`/oid4vc/signature-session`, {
			containerId,
			accessToken
		});
		qr = data.uri;

		showSignModal = true;
	}

	onMount(async () => {
		const ws = createWebsocket();
		ws.onmessage = async (event) => {
			const data = JSON.parse(event.data);
			if (data.container) {
				console.log(data);
				signingComplete = true;
			} else if (data.idVerified) {
				await attemptSignature();
				requestIdVerificaiton = false;
			}
		};
		const {
			data: { session }
		} = await apiClient.get('/users/session');
		if (session.isValid) {
			requestIdVerificaiton = false;
		}
		const token = $page.url.searchParams.get('token');
		const doc = await apiClient.post('/container/external-signer', { token });
		containerId = doc.data.container.id;
		accessToken = token as string;
		userEmail = doc.data.email;
		signingParties = [...doc.data.container.invitees, doc.data.container.ownedBy.email].filter(
			(e) => e !== userEmail
		);
		signatures = doc.data.container.signatures.map((s) => s.email);
		signedAlready = signatures.includes(userEmail);
		docUrl = (await apiClient.get(`/upload?cid=${doc.data.container.files[0].cid}`)).data;
	});
</script>

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
		<div class="flex flex-col gap-5">
			<div>
				<h1 class="text-lg text-gray-900 font-semibold">
					To sign the document scan the QR with your Identity wallet
				</h1>
			</div>
			<Qr data={qr}></Qr>
			{#if signingComplete}
				Signed ✅
			{/if}
		</div>
	{/if}
</Modal>

<div class="w-screen border-box p-10 py-20">
	<div class="flex gap-5 w-full justify-between">
		<Card class="min-w-[70%]">
			<div class="flex gap-2 flex-col h-full mb-4">
				{#if docUrl.length > 0}
					<div class="rounded h-full w-full overflow-hidden">
						<embed src={docUrl} width="100%" height="100%" type="application/pdf" />
					</div>
				{:else}
					Loading pdf.
				{/if}
			</div>
		</Card>
		<DocPreviewBar>
			<div class="flex flex-col h-full justify-between w-full">
				<div class="flex flex-col gap-4">
					<div class="flex items-center justify-between">
						<h1 class="font-bold text-2xl">Sign Document</h1>
					</div>
					<h2 class="font-bold text-lg">Signatures</h2>
					{#if signedAlready || signingComplete}
						<div class="text-gray-600 font-semibold">
							{`You: ✅ Signed`}
						</div>
					{:else}
						<div class="text-gray-800 font-bold">
							{`You: 🕐 Pending`}
						</div>
					{/if}

					{#each signingParties as invitee (invitee)}
						<div class="text-gray-600 font-semibold">
							{`${invitee}: ${signatures.includes(invitee) ? '✅ Signed' : '🕐 Pending'}`}
						</div>
					{/each}
					{#if !signedAlready}
						<p>Please take a look at the document and sign it by clicking the button below</p>
					{/if}
				</div>
				{#if !signedAlready && !signingComplete}
					<div class="flex flex-col gap-2">
						<div class="flex gap-4 w-full">
							<Button buttonClass="w-full" color="yellow" on:click={handleSignClick}
								>Sign Document</Button
							>
						</div>
					</div>
				{/if}
			</div>
		</DocPreviewBar>
	</div>
</div>
