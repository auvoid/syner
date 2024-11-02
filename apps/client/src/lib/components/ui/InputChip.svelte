<!-- Picked up from 
 https://github.com/skeletonlabs/skeleton/blob/master/packages/skeleton/src/lib/components/InputChip/InputChip.svelte -->
<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { flip } from 'svelte/animate';

	// Types
	import type { CssClasses, SvelteEvent } from '../types.ts';
	import { Helper, Label } from 'flowbite-svelte';

	// Event Dispatcher
	type InputChipEvent = {
		add: { event: KeyboardEvent; chipIndex: number; chipValue: string };
		remove: { event: MouseEvent; chipIndex: number; chipValue: string };
		addManually: { chipIndex: number; chipValue: string };
		removeManually: { chipValue: string };
		invalid: { event: KeyboardEvent; input: string };
		invalidManually: { input: string };
	};
	const dispatch = createEventDispatcher<InputChipEvent>();

	export let helperText: string = '';
	export let input = '';
	export let name: string;
	export let value: any[] = [];
	export let whitelist: string[] = [];
	export let max = -1;
	export let minlength = -1;
	export let maxlength = -1;
	export let allowUpperCase = false;
	export let allowDuplicates = false;
	export let validation: (...args: any[]) => boolean = () => true;
	export let duration = 150;
	export let required = false;
	export let chips: CssClasses = 'variant-filled';
	export let invalid: CssClasses = 'input-error';
	export let rounded: CssClasses = 'rounded-container-token';
	export let regionChipWrapper: CssClasses = '';
	export let regionChipList: CssClasses = '';
	export let regionInput: CssClasses = '';
	export let label = 'Chips select';

	const cBase = 'textarea cursor-pointer';
	const cChipWrapper = 'space-y-1';
	const cChipList = 'flex flex-wrap gap-2';
	const cInputField = 'unstyled bg-transparent border-0 !ring-0 p-0 w-full';

	let inputValid = true;
	let chipValues: Array<{ val: (typeof value)[0]; id: number }> =
		value?.map((val) => {
			return { val: val, id: Math.random() };
		}) || [];
	let selectElement: HTMLSelectElement;

	function resetFormHandler() {
		value = [];
	}
	onMount(() => {
		if (!selectElement.form) return;
		const externalForm = selectElement.form as HTMLFormElement;
		externalForm.addEventListener('reset', resetFormHandler);
		return () => {
			externalForm.removeEventListener('reset', resetFormHandler);
		};
	});

	function validateCustom(chip: string) {
		return validation === undefined || validation(chip);
	}

	function validateCount() {
		return max === -1 || value.length < max;
	}

	function validateLength(chip: string) {
		return (
			(minlength === -1 || chip.length >= minlength) &&
			(maxlength === -1 || chip.length <= maxlength)
		);
	}

	function validateWhiteList(chip: string) {
		return whitelist.length === 0 || whitelist.includes(chip);
	}

	function validateDuplicates(chip: string) {
		return allowDuplicates || !value.includes(chip);
	}

	function validate(chip = ''): boolean {
		if (!chip && !input) return false;
		chip = chip !== '' ? chip.trim() : input.trim();
		return (
			validateCustom(chip) &&
			validateCount() &&
			validateLength(chip) &&
			validateWhiteList(chip) &&
			validateDuplicates(chip)
		);
	}

	function addChipCommon(chip: string) {
		chip = allowUpperCase ? chip : chip.toLowerCase();
		value.push(chip);
		value = value;
		chipValues.push({ val: chip, id: Math.random() });
		chipValues = chipValues;
	}

	function removeChipCommon(chip: string) {
		let chipIndex = value.indexOf(chip);
		value.splice(chipIndex, 1);
		value = value;
		chipValues.splice(chipIndex, 1);
		chipValues = chipValues;
	}

	function onKeyHandler(event: KeyboardEvent): void {
		if (event.key !== 'Enter') return;
		event.preventDefault();
		inputValid = validate();
		if (inputValid === false) {
			dispatch('invalid', { event, input });
			return;
		}
		addChipCommon(input);
		dispatch('add', { event, chipIndex: value.length - 1, chipValue: input });
		input = '';
	}

	function removeChipInternally(
		event: SvelteEvent<MouseEvent, HTMLButtonElement>,
		chipIndex: number,
		chipValue: string
	): void {
		if ($$restProps.disabled) return;
		removeChipCommon(chipValue);
		dispatch('remove', { event, chipIndex, chipValue });
	}

	export function addChip(chip: string) {
		inputValid = validate(chip);
		if (inputValid === false) {
			dispatch('invalidManually', { input: chip });
			return;
		}
		addChipCommon(chip);
		dispatch('addManually', { chipIndex: value.length - 1, chipValue: chip });
	}

	export function removeChip(chip: string) {
		if ($$restProps.disabled) return;
		removeChipCommon(chip);
		dispatch('removeManually', { chipValue: chip });
	}

	function prunedRestProps() {
		delete $$restProps.class;
		return $$restProps;
	}

	$: classesInvalid = inputValid === false ? invalid : '';
	$: classesBase = `${cBase} ${rounded} ${$$props.class ?? ''} ${classesInvalid}`;
	$: classesChipWrapper = `${cChipWrapper} ${regionChipWrapper}`;
	$: classesChipList = `${cChipList} ${regionChipList}`;
	$: classesInput = `${cInputField} ${regionInput}`;
	$: chipValues =
		value?.map((val, i) => {
			if (chipValues[i]?.val === val) return chipValues[i];
			return { id: Math.random(), val: val };
		}) || [];
</script>

<div class="input-chip {classesBase}" class:opacity-50={$$restProps.disabled}>
	<div class="flex">
		<Label for="input" class="text-font-bold text-md mb-1">
			{label}
		</Label>
	</div>
	<div class="h-0 overflow-hidden">
		<select
			bind:this={selectElement}
			bind:value
			{name}
			multiple
			{required}
			aria-label={label}
			tabindex="-1"
		>
			{#each value as option}<option value={option}>{option}</option>{/each}
		</select>
	</div>
	<div class="input-chip-wrapper {classesChipWrapper}">
		<div
			class="p-2 rounded-lg border border-gray-300 focus:border-brand-green focus:ring-brand-green bg-gray-200"
		>
			<input
				type="text"
				bind:value={input}
				placeholder={$$restProps.placeholder ?? 'Enter values...'}
				class="input-chip-field text-sm {classesInput}"
				on:keydown={onKeyHandler}
				on:input
				on:focus
				on:blur
				disabled={$$restProps.disabled}
				{...prunedRestProps()}
			/>
		</div>
		{#if helperText}
			<Helper class="text-gray-500}">{helperText}</Helper>
		{/if}
		{#if chipValues.length}
			<div class="input-chip-list {classesChipList}">
				{#each chipValues as { id, val }, i (id)}
					<div animate:flip={{ duration }} class="text-sm bg-gray-200 rounded px-1">
						<button
							type="button"
							class="chip {chips}"
							on:click={(e) => removeChipInternally(e, i, val)}
							on:click
							on:keypress
							on:keydown
							on:keyup
						>
							<span>{val}</span>
							<span>x</span>
						</button>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>
