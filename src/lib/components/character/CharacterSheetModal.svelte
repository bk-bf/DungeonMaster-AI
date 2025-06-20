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

<!-- Slide-in panel from left without backdrop -->
<div
	class="fixed inset-y-0 left-80 z-50 w-2/3 max-w-4xl bg-white shadow-2xl border-l border-gray-200"
	bind:clientWidth={modalWidth}
	transition:fly={{ x: -modalWidth - 300, duration: 300, opacity: 1 }}
>
	<div class="h-full flex flex-col dnd-beyond-sheet">
		<!-- Enhanced D&D Beyond-style Header -->
		<div class="character-header p-6 relative z-10">
			<div class="flex items-center justify-between">
				<div class="flex items-center space-x-4">
					<div
						class="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center border-2 border-white border-opacity-30"
					>
						<span class="text-2xl font-bold text-white">
							{detailedCharacter?.basicInfo.name
								?.charAt(0)
								.toUpperCase() || "C"}
						</span>
					</div>
					<div>
						<div class="character-name">
							{detailedCharacter?.basicInfo.name ||
								"Unknown Character"}
						</div>
						<div class="character-details">
							Level {detailedCharacter?.basicInfo.level || 1}
							{detailedCharacter?.basicInfo.race || "Human"}
							{detailedCharacter?.basicInfo.class || "Fighter"}
						</div>
						<div class="character-details">
							{detailedCharacter?.basicInfo.background ||
								"Unknown Background"}
						</div>
					</div>
				</div>
				<button
					type="button"
					on:click={() => {
						console.log("Close button clicked");
						dispatch("close");
					}}
					class="close-button"
					aria-label="Close character sheet"
				>
					<svg
						class="w-5 h-5"
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

		<!-- Content area with D&D Beyond styling -->
		<div class="flex-1 overflow-y-auto p-6 space-y-6">
			{#if detailedCharacter}
				<!-- Ability Scores with D&D Beyond styling -->
				<div class="section-card">
					<div class="section-header">
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
						<h3 class="section-title">Ability Scores</h3>
					</div>
					<div class="p-6">
						<div class="grid grid-cols-3 md:grid-cols-6 gap-4">
							{#each Object.entries(detailedCharacter.abilityScores) as [ability, data]}
								<div class="ability-score p-4 text-center">
									<div class="ability-name">{ability}</div>
									<div class="ability-value">
										{(data as any).score}
									</div>
									<div
										class="ability-modifier {getAbilityModifierColor(
											(data as any).modifier,
										)}"
									>
										{(data as any).modifier}
									</div>
								</div>
							{/each}
						</div>
					</div>
				</div>

				<!-- Combat Stats with D&D Beyond styling -->
				<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div class="status-card hp p-4">
						<div class="flex items-center">
							<svg
								class="status-icon text-green-700"
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
							<div>
								<div class="status-label text-green-800">
									Hit Points
								</div>
								<div class="status-value text-green-900">
									{detailedCharacter.status.hitPoints ||
										"Unknown"}
								</div>
							</div>
						</div>
					</div>

					<div class="status-card ac p-4">
						<div class="flex items-center">
							<svg
								class="status-icon text-blue-700"
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
							<div>
								<div class="status-label text-blue-800">
									Armor Class
								</div>
								<div class="status-value text-blue-900">
									{detailedCharacter.status.armorClass ||
										"Unknown"}
								</div>
							</div>
						</div>
					</div>

					<div class="status-card speed p-4">
						<div class="flex items-center">
							<svg
								class="status-icon text-yellow-700"
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
							<div>
								<div class="status-label text-yellow-800">
									Speed
								</div>
								<div class="status-value text-yellow-900">
									{detailedCharacter.status.speed ||
										"Unknown"}
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- Skills & Equipment with D&D Beyond styling -->
				<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
					<!-- Skills -->
					<div class="section-card">
						<div class="section-header">
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
							<h3 class="section-title">Proficient Skills</h3>
						</div>
						<div class="p-6">
							{#each detailedCharacter.skills as skill}
								<div class="skill-item">
									<div class="skill-dot"></div>
									<span class="text-gray-700 font-medium"
										>{skill}</span
									>
								</div>
							{/each}
						</div>
					</div>

					<!-- Equipment -->
					<div class="section-card">
						<div class="section-header">
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
							<h3 class="section-title">Equipment</h3>
						</div>
						<div class="p-6">
							{#each detailedCharacter.equipment as item}
								<div class="equipment-item">
									<div class="equipment-dot"></div>
									<span class="text-gray-700 font-medium"
										>{item}</span
									>
								</div>
							{/each}
						</div>
					</div>
				</div>

				<!-- Raw Data Section with D&D Beyond styling -->
				<div class="raw-data-section">
					<details>
						<summary class="raw-data-summary">
							View Raw Character Sheet Data
						</summary>
						<div class="raw-data-content">
							<pre
								class="raw-data-pre">{characterSheet?.content ||
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

<!-- Enhanced D&D Beyond-style CSS -->
<style>
	.dnd-beyond-sheet {
		font-family: "Roboto", "Helvetica Neue", Arial, sans-serif;
		background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
	}

	.character-header {
		background: linear-gradient(
			135deg,
			#8b0000 0%,
			#dc143c 50%,
			#b22222 100%
		);
		color: white;
		position: relative;
		overflow: hidden;
	}

	.character-header::before {
		content: "";
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")
			repeat;
		opacity: 0.1;
	}

	.stat-card {
		background: white;
		border: 2px solid #e9ecef;
		border-radius: 8px;
		transition: all 0.2s ease;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.stat-card:hover {
		border-color: #dc143c;
		box-shadow: 0 4px 12px rgba(220, 20, 60, 0.15);
		transform: translateY(-1px);
	}

	.ability-score {
		background: linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%);
		border: 3px solid #e9ecef;
		border-radius: 12px;
		position: relative;
		overflow: hidden;
	}

	.ability-score::before {
		content: "";
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 3px;
		background: linear-gradient(90deg, #dc143c, #8b0000);
	}

	.ability-name {
		font-size: 11px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		color: #6c757d;
		margin-bottom: 4px;
	}

	.ability-value {
		font-size: 28px;
		font-weight: 900;
		color: #212529;
		line-height: 1;
		margin-bottom: 2px;
	}

	.ability-modifier {
		font-size: 14px;
		font-weight: 600;
		padding: 2px 8px;
		border-radius: 12px;
		background: #f8f9fa;
		border: 1px solid #dee2e6;
	}

	.status-card {
		border-radius: 12px;
		position: relative;
		overflow: hidden;
		border: 2px solid;
		background: white;
	}

	.status-card.hp {
		border-color: #28a745;
		background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
	}

	.status-card.ac {
		border-color: #007bff;
		background: linear-gradient(135deg, #d1ecf1 0%, #bee5eb 100%);
	}

	.status-card.speed {
		border-color: #ffc107;
		background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
	}

	.status-icon {
		width: 24px;
		height: 24px;
		margin-right: 8px;
	}

	.status-label {
		font-size: 12px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		margin-bottom: 4px;
	}

	.status-value {
		font-size: 24px;
		font-weight: 900;
		line-height: 1;
	}

	.section-card {
		background: white;
		border: 2px solid #e9ecef;
		border-radius: 12px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
		overflow: hidden;
	}

	.section-header {
		background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
		border-bottom: 2px solid #dee2e6;
		padding: 16px 20px;
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.section-title {
		font-size: 16px;
		font-weight: 700;
		color: #495057;
		margin: 0;
	}

	.skill-item,
	.equipment-item {
		padding: 8px 0;
		border-bottom: 1px solid #f8f9fa;
		display: flex;
		align-items: center;
		gap: 8px;
		transition: background-color 0.2s ease;
	}

	.skill-item:hover,
	.equipment-item:hover {
		background-color: #f8f9fa;
	}

	.skill-item:last-child,
	.equipment-item:last-child {
		border-bottom: none;
	}

	.skill-dot,
	.equipment-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		flex-shrink: 0;
	}

	.skill-dot {
		background: #6f42c1;
	}

	.equipment-dot {
		background: #fd7e14;
	}

	.character-name {
		font-size: 24px;
		font-weight: 900;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
		margin-bottom: 4px;
	}

	.character-details {
		font-size: 14px;
		opacity: 0.9;
		font-weight: 500;
	}

	.close-button {
		background: rgba(255, 255, 255, 0.2);
		border: 1px solid rgba(255, 255, 255, 0.3);
		color: white;
		border-radius: 6px;
		padding: 8px;
		transition: all 0.2s ease;
	}

	.close-button:hover {
		background: rgba(255, 255, 255, 0.3);
		border-color: rgba(255, 255, 255, 0.5);
	}

	.raw-data-section {
		background: #f8f9fa;
		border: 2px solid #e9ecef;
		border-radius: 12px;
		overflow: hidden;
	}

	.raw-data-summary {
		padding: 16px 20px;
		background: linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%);
		cursor: pointer;
		font-weight: 600;
		color: #495057;
		transition: background-color 0.2s ease;
	}

	.raw-data-summary:hover {
		background: linear-gradient(135deg, #dee2e6 0%, #ced4da 100%);
	}

	.raw-data-content {
		padding: 20px;
		border-top: 2px solid #dee2e6;
		background: white;
	}

	.raw-data-pre {
		font-size: 12px;
		color: #6c757d;
		white-space: pre-wrap;
		line-height: 1.4;
		margin: 0;
		font-family: "Consolas", "Monaco", "Courier New", monospace;
	}
</style>
