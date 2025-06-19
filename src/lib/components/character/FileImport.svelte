<!-- src/lib/components/character/FileImport.svelte -->
<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { contextFileManager } from "$lib/services/contextFiles";
	import { playerPreferencesStore } from "$lib/stores/playerPreferences";
	import { campaignStore } from "$lib/stores/campaigns";

	const dispatch = createEventDispatcher<{
		success: { type: "character" | "campaign"; data: any };
		error: string;
		cancel: void;
	}>();

	let characterFile: File | null = null;
	let campaignFile: File | null = null;
	let isProcessing = false;
	let characterFileInput: HTMLInputElement;
	let campaignFileInput: HTMLInputElement;
	let characterDragOver = false;
	let campaignDragOver = false;

	// ✅ ISSUE 1 FIX: Enhanced character file handling with proper validation
	async function handleCharacterFileSelect(event: Event) {
		console.log("📁 Character file select triggered");
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];

		if (!file) {
			console.log("❌ No character file selected");
			return;
		}

		console.log("📁 Processing character file:", file.name, file.type);

		// Enhanced file validation
		if (!file.type.includes("json") && !file.name.endsWith(".json")) {
			dispatch(
				"error",
				"Please select a valid JSON file for character data",
			);
			return;
		}

		characterFile = file;
		console.log("✅ Character file set:", characterFile.name);

		// Reset input to allow selecting the same file again
		target.value = "";
	}

	// ✅ ISSUE 1 FIX: Enhanced campaign file handling with proper validation
	async function handleCampaignFileSelect(event: Event) {
		console.log("📁 Campaign file select triggered");
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];

		if (!file) {
			console.log("❌ No campaign file selected");
			return;
		}

		console.log("📁 Processing campaign file:", file.name, file.type);

		// Enhanced file validation
		if (!file.type.includes("json") && !file.name.endsWith(".json")) {
			dispatch(
				"error",
				"Please select a valid JSON file for campaign data",
			);
			return;
		}

		campaignFile = file;
		console.log("✅ Campaign file set:", campaignFile.name);

		// Reset input to allow selecting the same file again
		target.value = "";
	}

	// ✅ ISSUE 1 FIX: Enhanced drag and drop with better validation
	function handleCharacterDragOver(event: DragEvent) {
		event.preventDefault();
		event.stopPropagation();
		characterDragOver = true;
	}

	function handleCharacterDragLeave(event: DragEvent) {
		event.preventDefault();
		event.stopPropagation();
		characterDragOver = false;
	}

	function handleCharacterDrop(event: DragEvent) {
		event.preventDefault();
		event.stopPropagation();
		characterDragOver = false;

		console.log("📁 Character file dropped");
		const file = event.dataTransfer?.files[0];

		if (!file) {
			dispatch("error", "No character file was dropped");
			return;
		}

		// Enhanced file validation for drag & drop
		const isJsonFile =
			file.type === "application/json" ||
			file.type.includes("json") ||
			file.name.endsWith(".json");

		if (isJsonFile) {
			console.log("✅ Valid character JSON file dropped:", file.name);
			characterFile = file;
		} else {
			console.log(
				"❌ Invalid character file type:",
				file.type,
				file.name,
			);
			dispatch(
				"error",
				`Invalid file type for character data. Expected JSON, got ${file.type || "unknown"}`,
			);
		}
	}

	function handleCampaignDragOver(event: DragEvent) {
		event.preventDefault();
		event.stopPropagation();
		campaignDragOver = true;
	}

	function handleCampaignDragLeave(event: DragEvent) {
		event.preventDefault();
		event.stopPropagation();
		campaignDragOver = false;
	}

	function handleCampaignDrop(event: DragEvent) {
		event.preventDefault();
		event.stopPropagation();
		campaignDragOver = false;

		console.log("📁 Campaign file dropped");
		const file = event.dataTransfer?.files[0];

		if (!file) {
			dispatch("error", "No campaign file was dropped");
			return;
		}

		// Enhanced file validation for drag & drop
		const isJsonFile =
			file.type === "application/json" ||
			file.type.includes("json") ||
			file.name.endsWith(".json");

		if (isJsonFile) {
			console.log("✅ Valid campaign JSON file dropped:", file.name);
			campaignFile = file;
		} else {
			console.log("❌ Invalid campaign file type:", file.type, file.name);
			dispatch(
				"error",
				`Invalid file type for campaign data. Expected JSON, got ${file.type || "unknown"}`,
			);
		}
	}

	// ✅ ISSUE 2 FIX: Enhanced file processing with comprehensive error handling
	async function processFiles() {
		if (!characterFile && !campaignFile) {
			dispatch("error", "Please select at least one file to import");
			return;
		}

		console.log("🔄 Starting file processing...");
		isProcessing = true;

		try {
			// Process character file first
			if (characterFile) {
				console.log(
					"📋 Processing character file:",
					characterFile.name,
				);
				const characterText = await characterFile.text();
				console.log(
					"📄 Character file content length:",
					characterText.length,
				);

				const characterData = JSON.parse(characterText);
				console.log(
					"✅ Character JSON parsed successfully:",
					Object.keys(characterData),
				);

				if (
					characterData.contextFiles &&
					characterData.playerPreferences
				) {
					console.log("📋 Valid character data structure detected");

					// ✅ ISSUE 2 FIX: Check if import method exists
					if (
						typeof contextFileManager.importCharacterData !==
						"function"
					) {
						console.error(
							"❌ contextFileManager.importCharacterData method not found",
						);
						dispatch(
							"error",
							"Character import functionality not available",
						);
						return;
					}

					const success =
						await contextFileManager.importCharacterData(
							characterData,
						);
					console.log("📋 Character data import result:", success);

					if (
						success &&
						characterData.playerPreferences?.preferences
					) {
						console.log(
							"🎯 Importing character player preferences",
						);

						// ✅ ISSUE 2 FIX: Check if preferences import method exists
						if (
							typeof playerPreferencesStore.importPreferences ===
							"function"
						) {
							playerPreferencesStore.importPreferences(
								characterData.playerPreferences.preferences,
							);
						} else {
							console.warn(
								"⚠️ playerPreferencesStore.importPreferences method not found",
							);
						}
					}

					if (!success) {
						dispatch(
							"error",
							"Failed to import character data - check console for details",
						);
						return;
					}
				} else {
					console.error(
						"❌ Invalid character data structure:",
						Object.keys(characterData),
					);
					dispatch(
						"error",
						"Invalid character data file format - expected contextFiles and playerPreferences",
					);
					return;
				}
			}

			// Process campaign file
			if (campaignFile) {
				console.log("🏰 Processing campaign file:", campaignFile.name);
				const campaignText = await campaignFile.text();
				console.log(
					"📄 Campaign file content length:",
					campaignText.length,
				);

				const campaignData = JSON.parse(campaignText);
				console.log(
					"✅ Campaign JSON parsed successfully:",
					Object.keys(campaignData),
				);

				if (campaignData.campaign) {
					console.log("🏰 Valid campaign data structure detected");

					// ✅ ISSUE 2 FIX: Check if campaign import method exists
					if (typeof campaignStore.importCampaign === "function") {
						const campaignId = campaignStore.importCampaign(
							campaignData.campaign,
						);
						console.log(
							"🏰 Campaign imported with ID:",
							campaignId,
						);

						// Import campaign preferences only if no character file was provided
						if (
							campaignData.playerPreferences?.preferences &&
							!characterFile
						) {
							console.log(
								"🎯 Importing campaign player preferences",
							);

							if (
								typeof playerPreferencesStore.importPreferences ===
								"function"
							) {
								playerPreferencesStore.importPreferences(
									campaignData.playerPreferences.preferences,
								);
							} else {
								console.warn(
									"⚠️ playerPreferencesStore.importPreferences method not found",
								);
							}
						}
					} else {
						console.error(
							"❌ campaignStore.importCampaign method not found",
						);
						dispatch(
							"error",
							"Campaign import functionality not available",
						);
						return;
					}
				} else {
					console.error(
						"❌ Invalid campaign data structure:",
						Object.keys(campaignData),
					);
					dispatch(
						"error",
						"Invalid campaign data file format - expected campaign object",
					);
					return;
				}
			}

			// Success - determine import type
			const importType =
				characterFile && campaignFile
					? "both"
					: characterFile
						? "character"
						: "campaign";
			console.log("✅ Import successful, type:", importType);

			dispatch("success", {
				type: importType as any,
				data: {
					characterImported: !!characterFile,
					campaignImported: !!campaignFile,
				},
			});
		} catch (error) {
			console.error("💥 Import processing error:", error);
			if (error instanceof SyntaxError) {
				dispatch(
					"error",
					"Invalid JSON file format. Please check your exported files.",
				);
			} else {
				dispatch(
					"error",
					`Failed to process files: ${error instanceof Error ? error.message : "Unknown error"}`,
				);
			}
		} finally {
			isProcessing = false;
		}
	}

	function removeCharacterFile() {
		console.log("🗑️ Removing character file");
		characterFile = null;
		if (characterFileInput) characterFileInput.value = "";
	}

	function removeCampaignFile() {
		console.log("🗑️ Removing campaign file");
		campaignFile = null;
		if (campaignFileInput) campaignFileInput.value = "";
	}

	// ✅ ISSUE 1 FIX: Add click handlers for drop zones
	function handleCharacterDropZoneClick() {
		console.log("🖱️ Character drop zone clicked, opening file picker");
		characterFileInput?.click();
	}

	function handleCampaignDropZoneClick() {
		console.log("🖱️ Campaign drop zone clicked, opening file picker");
		campaignFileInput?.click();
	}
</script>

<!-- ✅ ISSUE 3 FIX: Enhanced component rendering with higher z-index and proper accessibility -->
<div
	class="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4"
	role="dialog"
	aria-modal="true"
	aria-labelledby="import-dialog-title"
>
	<div
		class="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
	>
		<div class="p-6">
			<div class="flex items-center justify-between mb-6">
				<h3
					id="import-dialog-title"
					class="text-xl font-semibold text-gray-900"
				>
					Import Previous Session
				</h3>
				<button
					type="button"
					onclick={() => dispatch("cancel")}
					class="text-gray-400 hover:text-gray-600 transition-colors"
					aria-label="Close import dialog"
				>
					<svg
						class="w-6 h-6"
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

			<div class="space-y-6">
				<p class="text-sm text-gray-600">
					Import your previously exported files to continue your
					adventure. You can import character data, campaign data, or
					both.
				</p>

				<!-- Two Column Layout -->
				<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
					<!-- Character Data Upload -->
					<div class="space-y-4">
						<div class="flex items-center space-x-2">
							<div
								class="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center"
							>
								<svg
									class="w-5 h-5 text-red-600"
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
							</div>
							<h4 class="text-lg font-semibold text-gray-900">
								Character Data
							</h4>
						</div>

						<p class="text-sm text-gray-600">
							Import your character sheet, abilities, and player
							preferences.
						</p>

						{#if characterFile}
							<!-- Selected Character File -->
							<div
								class="border border-green-200 bg-green-50 rounded-lg p-4"
							>
								<div class="flex items-center justify-between">
									<div class="flex items-center space-x-3">
										<svg
											class="w-8 h-8 text-green-600"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
											/>
										</svg>
										<div>
											<p
												class="text-sm font-medium text-green-900"
											>
												{characterFile.name}
											</p>
											<p class="text-xs text-green-700">
												{(
													characterFile.size / 1024
												).toFixed(1)} KB
											</p>
										</div>
									</div>
									<button
										type="button"
										onclick={removeCharacterFile}
										class="text-green-600 hover:text-green-800 transition-colors"
										aria-label="Remove character file"
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
						{:else}
							<!-- ✅ ISSUE 1 FIX: Enhanced Character File Drop Zone with click handling -->
							<div
								class="border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer {characterDragOver
									? 'border-red-400 bg-red-50'
									: 'border-gray-300 hover:border-red-400 hover:bg-red-50'}"
								ondragover={handleCharacterDragOver}
								ondragleave={handleCharacterDragLeave}
								ondrop={handleCharacterDrop}
								onclick={handleCharacterDropZoneClick}
								role="button"
								tabindex="0"
								aria-label="Click to select character file or drag and drop JSON file here"
							>
								<svg
									class="mx-auto h-12 w-12 text-gray-400 mb-4"
									stroke="currentColor"
									fill="none"
									viewBox="0 0 48 48"
								>
									<path
										d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"
									/>
								</svg>

								<div class="space-y-2">
									<p
										class="text-sm font-medium text-gray-900"
									>
										Drop character file here
									</p>
									<p class="text-xs text-gray-500">
										or click to browse
									</p>
								</div>

								<!-- ✅ ISSUE 1 FIX: Enhanced file input with proper attributes -->
								<input
									bind:this={characterFileInput}
									type="file"
									accept=".json,application/json"
									onchange={handleCharacterFileSelect}
									class="hidden"
									aria-hidden="true"
								/>

								<button
									type="button"
									onclick={() => characterFileInput?.click()}
									class="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
								>
									Choose Character File
								</button>
							</div>
						{/if}

						<div class="text-xs text-gray-500">
							<p><strong>Character files include:</strong></p>
							<ul class="list-disc list-inside mt-1 space-y-1">
								<li>Character sheet and stats</li>
								<li>Player preferences</li>
								<li>Character progression</li>
							</ul>
						</div>
					</div>

					<!-- Campaign Data Upload -->
					<div class="space-y-4">
						<div class="flex items-center space-x-2">
							<div
								class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center"
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
										d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
									/>
								</svg>
							</div>
							<h4 class="text-lg font-semibold text-gray-900">
								Campaign Data
							</h4>
						</div>

						<p class="text-sm text-gray-600">
							Import your campaign history, messages, and
							adventure progress.
						</p>

						{#if campaignFile}
							<!-- Selected Campaign File -->
							<div
								class="border border-green-200 bg-green-50 rounded-lg p-4"
							>
								<div class="flex items-center justify-between">
									<div class="flex items-center space-x-3">
										<svg
											class="w-8 h-8 text-green-600"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
											/>
										</svg>
										<div>
											<p
												class="text-sm font-medium text-green-900"
											>
												{campaignFile.name}
											</p>
											<p class="text-xs text-green-700">
												{(
													campaignFile.size / 1024
												).toFixed(1)} KB
											</p>
										</div>
									</div>
									<button
										type="button"
										onclick={removeCampaignFile}
										class="text-green-600 hover:text-green-800 transition-colors"
										aria-label="Remove campaign file"
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
						{:else}
							<!-- ✅ ISSUE 1 FIX: Enhanced Campaign File Drop Zone with click handling -->
							<div
								class="border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer {campaignDragOver
									? 'border-blue-400 bg-blue-50'
									: 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'}"
								ondragover={handleCampaignDragOver}
								ondragleave={handleCampaignDragLeave}
								ondrop={handleCampaignDrop}
								onclick={handleCampaignDropZoneClick}
								role="button"
								tabindex="0"
								aria-label="Click to select campaign file or drag and drop JSON file here"
							>
								<svg
									class="mx-auto h-12 w-12 text-gray-400 mb-4"
									stroke="currentColor"
									fill="none"
									viewBox="0 0 48 48"
								>
									<path
										d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"
									/>
								</svg>

								<div class="space-y-2">
									<p
										class="text-sm font-medium text-gray-900"
									>
										Drop campaign file here
									</p>
									<p class="text-xs text-gray-500">
										or click to browse
									</p>
								</div>

								<!-- ✅ ISSUE 1 FIX: Enhanced file input with proper attributes -->
								<input
									bind:this={campaignFileInput}
									type="file"
									accept=".json,application/json"
									onchange={handleCampaignFileSelect}
									class="hidden"
									aria-hidden="true"
								/>

								<button
									type="button"
									onclick={() => campaignFileInput?.click()}
									class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
								>
									Choose Campaign File
								</button>
							</div>
						{/if}

						<div class="text-xs text-gray-500">
							<p><strong>Campaign files include:</strong></p>
							<ul class="list-disc list-inside mt-1 space-y-1">
								<li>Chat history and messages</li>
								<li>Campaign progress</li>
								<li>Adventure timeline</li>
							</ul>
						</div>
					</div>
				</div>

				<!-- Import Button -->
				<div
					class="flex justify-between items-center pt-6 border-t border-gray-200"
				>
					<button
						type="button"
						onclick={() => dispatch("cancel")}
						class="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
					>
						Cancel
					</button>

					<button
						type="button"
						onclick={processFiles}
						disabled={(!characterFile && !campaignFile) ||
							isProcessing}
						class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
					>
						{#if isProcessing}
							<div
								class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"
							></div>
							<span>Processing...</span>
						{:else}
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
									d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
								/>
							</svg>
							<span>Import Files</span>
						{/if}
					</button>
				</div>

				<!-- Debug Info (visible during processing) -->
				{#if isProcessing}
					<div class="text-xs text-gray-400 bg-gray-50 p-2 rounded">
						Processing files... Check browser console for detailed
						logs.
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>
