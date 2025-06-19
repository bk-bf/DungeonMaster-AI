<script lang="ts">
	import { campaignStore } from "$lib/stores/campaigns";
	import { contextFileManager } from "$lib/services/contextFiles";
	import { playerPreferencesStore } from "$lib/stores/playerPreferences";
	import { sessionManager } from "$lib/services/session";
	import { goto } from "$app/navigation";

	let isOpen = false;
	let showExitConfirm = false;

	function toggleDropdown() {
		isOpen = !isOpen;
	}

	function handleClickOutside(event: MouseEvent) {
		if (
			isOpen &&
			!(event.target as Element).closest(".settings-dropdown")
		) {
			isOpen = false;
		}
	}

	function handleExitSession() {
		showExitConfirm = true;
		isOpen = false;
	}

	function confirmExitSession() {
		try {
			// Clear all session data
			campaignStore.clearAllData();

			// Clear context files
			contextFileManager.getAllFiles().forEach((file) => {
				contextFileManager.deleteFile?.(file.id);
			});

			// Clear player preferences
			playerPreferencesStore.clearPreferences();

			console.log("✅ Session ended successfully");

			// Redirect to character creation
			goto("/", { replaceState: true });
		} catch (error) {
			console.error("❌ Failed to exit session:", error);
			alert("Failed to exit session");
		} finally {
			showExitConfirm = false;
		}
	}

	function cancelExitSession() {
		showExitConfirm = false;
	}

	function handleExportCampaign() {
		try {
			const exportData = campaignStore.exportCampaign();

			if (!exportData) {
				alert("No active campaign to export");
				return;
			}

			// Create download link
			const blob = new Blob([exportData], { type: "application/json" });
			const url = URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = `dungeonmaster-campaign-${new Date().toISOString().split("T")[0]}.json`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			URL.revokeObjectURL(url);

			console.log("✅ Campaign exported successfully");
		} catch (error) {
			console.error("❌ Export failed:", error);
			alert("Failed to export campaign");
		}

		isOpen = false;
	}

	function handleExportContextFiles() {
		try {
			const contextFiles = contextFileManager.getAllFiles();
			const exportData = {
				contextFiles,
				playerPreferences: $playerPreferencesStore,
				exportDate: new Date().toISOString(),
				version: "1.0",
			};

			const blob = new Blob([JSON.stringify(exportData, null, 2)], {
				type: "application/json",
			});
			const url = URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = `dungeonmaster-character-data-${new Date().toISOString().split("T")[0]}.json`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			URL.revokeObjectURL(url);

			console.log("✅ Character data exported successfully");
		} catch (error) {
			console.error("❌ Character export failed:", error);
			alert("Failed to export character data");
		}

		isOpen = false;
	}

	function handleShowDebugInfo() {
		const debugInfo = {
			campaigns: $campaignStore.campaigns.length,
			contextFiles: contextFileManager.getAllFiles().length,
			playerPreferences: $playerPreferencesStore.isCollected,
			localStorage: {
				campaigns: !!localStorage.getItem("dungeonmaster-campaigns"),
				contextFiles: !!localStorage.getItem(
					"dungeonmaster-context-files",
				),
				preferences: !!localStorage.getItem(
					"dungeonmaster-player-preferences",
				),
			},
		};

		console.log("🐛 Debug Info:", debugInfo);
		alert(
			`Debug Info:\n\nCampaigns: ${debugInfo.campaigns}\nContext Files: ${debugInfo.contextFiles}\nPreferences: ${debugInfo.playerPreferences}\n\nCheck console for full details`,
		);
		isOpen = false;
	}
</script>

<svelte:window onclick={handleClickOutside} />

<!-- Exit Session Confirmation Modal -->
{#if showExitConfirm}
	<div
		class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
	>
		<div class="bg-white rounded-lg max-w-md w-full p-6">
			<div class="flex items-center space-x-3 mb-4">
				<div
					class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center"
				>
					<svg
						class="w-6 h-6 text-red-600"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z"
						/>
					</svg>
				</div>
				<div>
					<h3 class="text-lg font-semibold text-gray-900">
						Exit Session
					</h3>
					<p class="text-sm text-gray-600">
						This will clear all your data
					</p>
				</div>
			</div>

			<div class="space-y-4">
				<div
					class="bg-yellow-50 border border-yellow-200 rounded-lg p-4"
				>
					<p class="text-sm text-yellow-800">
						<strong>Warning:</strong> This will permanently delete all
						your campaign data, character information, and preferences
						from this device.
					</p>
				</div>

				<div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
					<p class="text-sm text-blue-800">
						<strong>Recommendation:</strong> Export your data first using
						the export options above if you want to keep your progress.
					</p>
				</div>

				<div class="flex space-x-3">
					<button
						onclick={cancelExitSession}
						class="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
					>
						Cancel
					</button>
					<button
						onclick={confirmExitSession}
						class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
					>
						Exit Session
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}

<div class="relative settings-dropdown">
	<button
		type="button"
		onclick={toggleDropdown}
		class="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-red-700 transition-colors"
		aria-label="Settings"
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
				d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
			/>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
			/>
		</svg>
	</button>

	{#if isOpen}
		<div
			class="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20"
		>
			<!-- Export Options -->
			<div
				class="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide"
			>
				Export Data
			</div>

			<button
				onclick={handleExportCampaign}
				class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
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
						d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
					/>
				</svg>
				<span>Export Campaign</span>
			</button>

			<button
				onclick={handleExportContextFiles}
				class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
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
						d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
					/>
				</svg>
				<span>Export Character Data</span>
			</button>

			<hr class="my-1" />

			<!-- Session Management -->
			<div
				class="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide"
			>
				Session
			</div>

			<button
				onclick={handleExitSession}
				class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
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
						d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
					/>
				</svg>
				<span>Exit Session</span>
			</button>

			<hr class="my-1" />

			<!-- Debug & Help -->
			<button
				onclick={handleShowDebugInfo}
				class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
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
						d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
				<span>Debug Info</span>
			</button>

			<button
				onclick={() => (isOpen = false)}
				class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
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
						d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
				<span>Help & Support</span>
			</button>
		</div>
	{/if}
</div>
