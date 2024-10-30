<script lang="ts">
	import { page } from '$app/stores';
	import { apiClient } from '$lib/axios/axios';
	import Qr from '$lib/components/ui/Qr.svelte';
	import { createWebsocket } from '$lib/utils/websocket';
	import { Modal } from 'flowbite-svelte';
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

	$: signingComplete = false;
	$: docUrl = '';
	let showSignModal = false;
	let requestIdVerificaiton = true;

	let qr: string;

	let attemptSignature: () => Promise<void>;

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
		attemptSignature = async () => {
			const {
				data: { session }
			} = await apiClient.get('/users/session');
			if (session.isValid) {
				requestIdVerificaiton = false;
			} else {
				return;
			}
			const token = $page.url.searchParams.get('token');
			const doc = await apiClient.post('/container/external-signer', { token });
			docUrl = (await apiClient.get(`/upload?cid=${doc.data.files[0].cid}`)).data;
			const sigSession = await apiClient
				.post(`/oid4vc/signature-session`, {
					containerId: doc.data.id,
					accessToken: token
				})
				.catch((e) => {
					console.log(e);
					addToast({
						type: 'error',
						message: e
					});
				});
			if (sigSession && sigSession.data) {
				qr = sigSession.data.uri;
				console.log('qr', qr);
				showSignModal = true;
			}
		};
		attemptSignature();
	});
</script>

<div class="flex flex-col w-screen h-[calc(100vh-1rem)] my-4 mx-4">
	<h1>Syner Sign</h1>
	<div class="flex h-full w-full gap-2">
		<div class="flex gap-2 flex-col w-3/4 mb-4">
			{#if docUrl.length > 0}
				<div class="rounded h-full w-full overflow-hidden">
					<embed src={docUrl} height="100%" width="100%" type="application/pdf" />
				</div>
			{:else}
				Loading pdf.
			{/if}
		</div>
		<div class="">
			<h1>Sign Document</h1>
			{#if requestIdVerificaiton}
				<div>
					<p class="text-lg text-gray-900 font-semibold">
						you need to be verified first, please clickk the button below to get verified
					</p>
					<Button on:click={verifyUser}>Start Verification</Button>
				</div>
			{:else}
				<div>
					<p class="text-lg text-gray-900 font-semibold">
						To sign the document scan the QR with your Identity wallet
					</p>
				</div>
				{#if qr}
					<Qr data={qr}></Qr>
				{:else}
					Loading QR
				{/if}
				{#if signingComplete}
					Signed ✅
				{/if}
			{/if}
		</div>
	</div>
</div>
