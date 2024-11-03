<script lang="ts">
	import Input from '$lib/components/ui/Input.svelte';
	import InputChip from '$lib/components/ui/InputChip.svelte';
	import {
		Card,
		Dropzone,
		Textarea,
		Label,
		Toolbar,
		ToolbarGroup,
		ToolbarButton,
		Helper
	} from 'flowbite-svelte';
	import {
		CalendarMonthSolid,
		CodeOutline,
		CogSolid,
		DownloadSolid,
		FaceGrinOutline,
		ImageOutline,
		ListOutline,
		MapPinAltSolid,
		PaperClipOutline,
		UploadOutline
	} from 'flowbite-svelte-icons';
	import Button from '$lib/components/ui/Button.svelte';
	import { user } from '$lib/store/store';
	import { addToast } from '../../../store';
	import { error } from '@sveltejs/kit';

	export let docName: string;
	export let signingParties: string[];
	export let emailContent: string;
	export let pdfFile: FileList | undefined;
	export let isPdfUploading: boolean;
	export let uploadHandler: () => void | Promise<void>;
	export let fileName: undefined | string;

	const dropHandle = (event: DragEvent) => {
		event.preventDefault();
		if (event.dataTransfer?.items) {
			fileName = [...event.dataTransfer.items][0].getAsFile()?.name;
		}
		if (!pdfFile || !pdfFile[0]) return;
		uploadHandler();
	};

	const handleChange = (event: Event) => {
		const useEvent = event as DragEvent;
		if (useEvent.dataTransfer && useEvent.dataTransfer.items) {
			fileName = [...useEvent.dataTransfer.items][0].getAsFile()?.name;
		}
		if (!pdfFile || !pdfFile[0]) return;
		uploadHandler();
	};

	const validateEnteredEmail: (...args: any[]) => boolean = (...args: any[]) => {
		if (/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(args[0])) {
			addToast({
				type: "error",
				message: "Invalid Email"
			})
			return false
		}
		if ($user && args[0] === $user.email) {
			addToast({
				type: 'error',
				message: "You can't add your own email as a signee in this field."
			})
			return false
		} 
		if (signingParties.includes(args[0])) {
			addToast({
				type: "error",
				message: "Can't add duplicate mails"
			})
			return false
		}
		return true;
	};

	$: fileName = pdfFile && pdfFile[0].name;
</script>

<main class="w-full flex gap-5">
	<div class="w-full flex gap-5">
		<Card class="shadow-xl max-w-full h-[calc(100vh-130px)]">
			<h1 class="text-3xl font-bold text-gray-700 mb-5">New Document</h1>
			<div class="flex flex-col gap-5 mb-10">
				<div class="flex gap-5 w-full">
					<div class="w-full">
						<Input
							variant="text"
							label="Document Name"
							helperText="Name your Document"
							placeholder="My New Document"
							bind:value={docName}
						></Input>
					</div>
					<div class="w-full">
						<InputChip
							name="invitees"
							label="Add Signing Parties"
							placeholder="name@example.com"
							bind:value={signingParties}
							helperText="Enter the emails of the signing parties"
							validation={validateEnteredEmail}
							allowDuplicates={false}
						/>
					</div>
				</div>
				<div class="flex gap-5 w-full">
					<div class="w-full">
						<Label class="text-font-bold text-md mb-1">Upload Document to be signed</Label>
						{#if !isPdfUploading}
							<Dropzone
								on:drop={dropHandle}
								on:dragover={(event) => {
									event.preventDefault();
								}}
								on:change={handleChange}
								bind:files={pdfFile}
								class="bg-gray-200"
								accept={'.pdf'}
							>
								<UploadOutline size="xl"></UploadOutline>
								{#if !pdfFile}
									<p class="mb-2 text-sm text-gray-500">
										<span class="font-semibold">Click to upload</span> or drag and drop
									</p>
									<p class="text-xs text-gray-500">PDF Format Only (File Size: 30MB)</p>
								{:else}
									<p>{fileName}</p>
									<Button
										on:click={() => {
											pdfFile = undefined;
										}}>Remove</Button
									>
								{/if}
							</Dropzone>
						{:else}
							<p class="bg-gray-200 p-2 rounded-lg border border-gray-300">Pdf is uploading...</p>
						{/if}
					</div>
					<div class="w-full future-disabled">
						<div class="future-disabled">
							<Label for="input" class="text-font-bold text-md mb-1 text-gray-800"
								>Your Message</Label
							>
							<Textarea
								class="bg-gray-200"
								placeholder="Write text here..."
								rows={6}
								bind:value={emailContent}
								disabled
							>
								<Toolbar class="future-disabled" slot="header" embedded>
									<ToolbarGroup>
										<ToolbarButton name="Attach file"
											><PaperClipOutline class="w-6 h-6 text-gray-500" /></ToolbarButton
										>
										<ToolbarButton name="Embed map"
											><MapPinAltSolid class="w-6 h-6 text-gray-500" /></ToolbarButton
										>
										<ToolbarButton name="Upload image"
											><ImageOutline class="w-6 h-6 text-gray-500" /></ToolbarButton
										>
										<ToolbarButton name="Format code"
											><CodeOutline class="w-6 h-6 text-gray-500" /></ToolbarButton
										>
										<ToolbarButton name="Add emoji"
											><FaceGrinOutline class="w-6 h-6 text-gray-500" /></ToolbarButton
										>
									</ToolbarGroup>
									<ToolbarGroup>
										<ToolbarButton name="Add List">
											<ListOutline class="w-6 h-6 text-gray-500"></ListOutline>
										</ToolbarButton>
										<ToolbarButton name="Settings">
											<CogSolid class="w-6 h-6 text-gray-500"></CogSolid>
										</ToolbarButton>
										<ToolbarButton name="Calender">
											<CalendarMonthSolid class="w-6 h-6 text-gray-500"></CalendarMonthSolid>
										</ToolbarButton>
										<ToolbarButton name="Download">
											<DownloadSolid class="w-6 h-6 text-gray-500"></DownloadSolid>
										</ToolbarButton>
									</ToolbarGroup>
								</Toolbar>
							</Textarea>
							<Helper class="ms-1 mt-1 text-gray-500">
								Write the message to be sent along with the document in email
							</Helper>
						</div>
					</div>
				</div>
			</div>
		</Card>
	</div>
</main>
