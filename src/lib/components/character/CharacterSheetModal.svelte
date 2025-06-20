<!-- src/lib/components/character/CharacterSheetModal.svelte -->
<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { fly } from "svelte/transition";
	import { contextFileManager } from "$lib/services/contextFiles";
	import { contextManager } from "$lib/services/context";

	const dispatch = createEventDispatcher<{
		close: void;
	}>();

	let modalWidth = 0; // For transition calculation

	// Get character data from context files
	$: contextFiles = contextFileManager.getAllFiles();
	$: characterSheet = contextFiles.find((f) => f.id === "character_sheet");
	$: characterData = characterSheet
		? contextManager.parseCharacterFromMD(characterSheet.content)
		: null;

	// Parse additional character info from markdown
	function parseDetailedCharacterInfo(content: string) {
		if (!content) return null;

		const extractSection = (sectionName: string) => {
			const regex = new RegExp(
				`## ${sectionName}\\s*([\\s\\S]*?)(?=##|$)`,
			);
			const match = content.match(regex);
			return match ? match[1].trim() : "";
		};

		const extractAbilityScores = () => {
			const abilitySection = extractSection("Ability Scores");
			const abilities: Record<
				string,
				{ score: number; modifier: string }
			> = {};
			const lines = abilitySection.split("\n");

			lines.forEach((line) => {
				const match = line.match(
					/\*\*(\w+)\*\*:\s*(\d+)\s*\(([+-]\d+)\)/,
				);
				if (match) {
					abilities[match[1].toLowerCase()] = {
						score: parseInt(match[2]),
						modifier: match[3],
					};
				}
			});

			return abilities;
		};

		const extractEquipment = () => {
			const equipSection = extractSection("Equipment");
			return equipSection
				.split("\n")
				.filter((line) => line.trim() && !line.includes("*"));
		};

		const extractSkills = () => {
			const skillsSection = extractSection("Skills & Proficiencies");
			const skillMatch = skillsSection.match(
				/\*\*Proficient Skills\*\*:\s*(.+)/,
			);
			return skillMatch
				? skillMatch[1].split(",").map((s) => s.trim())
				: [];
		};

		const extractStatus = () => {
			const statusSection = extractSection("Current Status");
			const status = {
				hitPoints: "Unknown",
				armorClass: "Unknown",
				speed: "Unknown",
			};

			const hpMatch = statusSection.match(/\*\*Hit Points\*\*:\s*(.+)/);
			const acMatch = statusSection.match(/\*\*Armor Class\*\*:\s*(.+)/);
			const speedMatch = statusSection.match(/\*\*Speed\*\*:\s*(.+)/);

			if (hpMatch) status.hitPoints = hpMatch[1];
			if (acMatch) status.armorClass = acMatch[1];
			if (speedMatch) status.speed = speedMatch[1];

			return status;
		};

		return {
			basicInfo: {
				name: characterData?.name || "Unknown",
				race: content.match(/\*\*Race\*\*:\s*(.+)/)?.[1] || "Human",
				class: characterData?.class || "Unknown",
				level: characterData?.level || 1,
				background: characterData?.background || "Unknown",
			},
			abilityScores: extractAbilityScores(),
			skills: extractSkills(),
			equipment: extractEquipment(),
			status: extractStatus(),
		};
	}

	$: detailedCharacter = characterSheet
		? parseDetailedCharacterInfo(characterSheet.content)
		: null;

	function getAbilityModifierColor(modifier: string) {
		const num = parseInt(modifier);
		if (num >= 3) return "text-green-600";
		if (num >= 1) return "text-blue-600";
		if (num === 0) return "text-gray-600";
		if (num >= -2) return "text-orange-600";
		return "text-red-600";
	}

	// Handle escape key to close
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === "Escape") {
			dispatch("close");
		}
	}
</script>

<svelte:window on:keydown={handleKeydown} />

<!-- Slide-in panel from right without backdrop -->
<div
	class="fixed inset-y-0 left-80 z-50 w-2/3 max-w-4xl bg-white shadow-2xl border-l border-gray-200"
	bind:clientWidth={modalWidth}
	transition:fly={{ x: -modalWidth, duration: 300, opacity: 1 }}
>
	<div class="h-full flex flex-col">
		<!-- Header -->
		<div
			class="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50"
		>
			<div class="flex items-center space-x-2">
				<svg
					class="w-4 h-4 text-gray-500"
					fill="currentColor"
					viewBox="0 0 16 16"
				>
					<path
						d="M4 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H4zm0 1h8a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1z"
					/>
				</svg>
				<h2 class="text-lg font-semibold text-gray-900">
					Character Sheet
				</h2>
			</div>
			<div class="flex items-center space-x-4">
				<span class="text-xs text-gray-500">character_sheet.md</span>
				<button
					onclick={() => dispatch("close")}
					class="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-200 rounded"
					aria-label="Close character sheet"
				>
					<svg
						class="w-4 h-4"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			</div>
		</div>

		<!-- Content area -->
		<div class="flex-1 overflow-y-auto bg-white">
			{#if detailedCharacter}
				<div class="p-6 space-y-6">
					<!-- Character Basic Info -->
					<div
						class="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-6 border border-red-200"
					>
						<div
							class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4"
						>
							<div class="text-center">
								<div class="text-sm font-medium text-gray-600">
									Character Name
								</div>
								<div class="text-xl font-bold text-gray-900">
									{detailedCharacter.basicInfo.name}
								</div>
							</div>
							<div class="text-center">
								<div class="text-sm font-medium text-gray-600">
									Race
								</div>
								<div
									class="text-lg font-semibold text-gray-800"
								>
									{detailedCharacter.basicInfo.race}
								</div>
							</div>
							<div class="text-center">
								<div class="text-sm font-medium text-gray-600">
									Class
								</div>
								<div
									class="text-lg font-semibold text-gray-800"
								>
									{detailedCharacter.basicInfo.class}
								</div>
							</div>
							<div class="text-center">
								<div class="text-sm font-medium text-gray-600">
									Level
								</div>
								<div class="text-2xl font-bold text-red-600">
									{detailedCharacter.basicInfo.level}
								</div>
							</div>
							<div class="text-center">
								<div class="text-sm font-medium text-gray-600">
									Background
								</div>
								<div
									class="text-lg font-semibold text-gray-800"
								>
									{detailedCharacter.basicInfo.background}
								</div>
							</div>
						</div>
					</div>

					<!-- Ability Scores -->
					<div class="bg-white rounded-lg border border-gray-200 p-6">
						<h3
							class="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2"
						>
							<svg
								class="w-5 h-5 text-blue-600"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
								/>
							</svg>
							<span>Ability Scores</span>
						</h3>
						<div class="grid grid-cols-2 md:grid-cols-3 gap-4">
							{#each Object.entries(detailedCharacter.abilityScores) as [ability, data]}
								<div
									class="bg-gray-50 rounded-lg p-4 text-center border"
								>
									<div
										class="text-sm font-medium text-gray-600 uppercase"
									>
										{ability}
									</div>
									<div
										class="text-2xl font-bold text-gray-900"
									>
										{(data as any).score}
									</div>
									<div
										class="text-lg font-semibold {getAbilityModifierColor(
											(data as any).modifier,
										)}"
									>
										{(data as any).modifier}
									</div>
								</div>
							{/each}
						</div>
					</div>

					<!-- Current Status -->
					<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div
							class="bg-green-50 rounded-lg p-4 border border-green-200"
						>
							<div class="flex items-center space-x-2">
								<svg
									class="w-5 h-5 text-green-600"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
									/>
								</svg>
								<span class="font-medium text-green-800"
									>Hit Points</span
								>
							</div>
							<div class="text-2xl font-bold text-green-900 mt-2">
								{detailedCharacter.status.hitPoints ||
									"Unknown"}
							</div>
						</div>

						<div
							class="bg-blue-50 rounded-lg p-4 border border-blue-200"
						>
							<div class="flex items-center space-x-2">
								<svg
									class="w-5 h-5 text-blue-600"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
									/>
								</svg>
								<span class="font-medium text-blue-800"
									>Armor Class</span
								>
							</div>
							<div class="text-2xl font-bold text-blue-900 mt-2">
								{detailedCharacter.status.armorClass ||
									"Unknown"}
							</div>
						</div>

						<div
							class="bg-yellow-50 rounded-lg p-4 border border-yellow-200"
						>
							<div class="flex items-center space-x-2">
								<svg
									class="w-5 h-5 text-yellow-600"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M13 10V3L4 14h7v7l9-11h-7z"
									/>
								</svg>
								<span class="font-medium text-yellow-800"
									>Speed</span
								>
							</div>
							<div
								class="text-2xl font-bold text-yellow-900 mt-2"
							>
								{detailedCharacter.status.speed || "Unknown"}
							</div>
						</div>
					</div>

					<!-- Skills & Equipment -->
					<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
						<!-- Skills -->
						<div
							class="bg-white rounded-lg border border-gray-200 p-6"
						>
							<h3
								class="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2"
							>
								<svg
									class="w-5 h-5 text-purple-600"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
									/>
								</svg>
								<span>Proficient Skills</span>
							</h3>
							<div class="space-y-2">
								{#each detailedCharacter.skills as skill}
									<div class="flex items-center space-x-2">
										<div
											class="w-2 h-2 bg-purple-500 rounded-full"
										></div>
										<span class="text-gray-700"
											>{skill}</span
										>
									</div>
								{/each}
							</div>
						</div>

						<!-- Equipment -->
						<div
							class="bg-white rounded-lg border border-gray-200 p-6"
						>
							<h3
								class="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2"
							>
								<svg
									class="w-5 h-5 text-orange-600"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
									/>
								</svg>
								<span>Equipment</span>
							</h3>
							<div class="space-y-2">
								{#each detailedCharacter.equipment as item}
									<div class="flex items-center space-x-2">
										<div
											class="w-2 h-2 bg-orange-500 rounded-full"
										></div>
										<span class="text-gray-700">{item}</span
										>
									</div>
								{/each}
							</div>
						</div>
					</div>

					<!-- Character Sheet Raw Data (Collapsible) -->
					<details
						class="bg-gray-50 rounded-lg border border-gray-200"
					>
						<summary
							class="p-4 cursor-pointer font-medium text-gray-700 hover:text-gray-900"
						>
							View Raw Character Sheet Data
						</summary>
						<div class="p-4 border-t border-gray-200">
							<pre
								class="text-sm text-gray-600 whitespace-pre-wrap">{characterSheet?.content ||
									"No character sheet data available"}</pre>
						</div>
					</details>
				</div>
			{:else}
				<!-- No Character Data -->
				<div class="p-12 text-center">
					<svg
						class="w-16 h-16 text-gray-400 mx-auto mb-4"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
						/>
					</svg>
					<h3 class="text-lg font-semibold text-gray-900 mb-2">
						No Character Sheet Found
					</h3>
					<p class="text-gray-600">
						Create a character to view your character sheet.
					</p>
				</div>
			{/if}
		</div>
	</div>
</div>
