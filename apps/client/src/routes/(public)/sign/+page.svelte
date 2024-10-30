<script lang="ts">
	import { page } from '$app/stores';
	import { apiClient } from '$lib/axios/axios';
	import Qr from '$lib/components/ui/Qr.svelte';
	import { createWebsocket } from '$lib/utils/websocket';
	import { Modal } from 'flowbite-svelte';
	import { onMount } from 'svelte';
	import { addToast } from '../../store';
	import { Veriff} from "@veriff/js-sdk"
	import { PUBLIC_VERIFF_KEY} from '$env/static/public';

	$: signingComplete = false;
	$: docUrl = '';
	let showSignModal = false;
	let requestIdVerificaiton = true

	let qr: string;

	async function attemptSignature() {
		const { data: session} = await apiClient.get('/users/session')
		if (session.isValid) {
			requestIdVerificaiton = false
		} else {
			const veriff = Veriff({
					apiKey: PUBLIC_VERIFF_KEY,
					parentId: 'veriff-root'
				});
				veriff.setParams({
					person: {
						givenName: '',
						lastName: ''
					},
					vendorData: `session::${session.id}`
				});
				veriff.mount({
					submitBtnText: 'Get Verified'
				});
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
	}



	onMount(async () => {
		const ws = createWebsocket();
		ws.onmessage = async (event) => {
			const data = JSON.parse(event.data);
			if (data.container) {
				console.log(data);
				signingComplete = true;
			}
		};
	});
</script>

<!-- <Modal title="Sign Document" bind:open={showSignModal}>
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
</Modal> -->

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
					To sign the document scan the QR with your Identity wallet
				</p>
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
