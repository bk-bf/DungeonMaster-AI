<script lang="ts">
	import { playerPreferencesStore } from "$lib/stores/playerPreferences";
	import { createEventDispatcher } from "svelte";
	import type { PlayerPreferences } from "$lib/stores/playerPreferences";

	const dispatch = createEventDispatcher<{
		complete: PlayerPreferences;
		skip: void;
	}>();

	let preferences: PlayerPreferences = {
		favoriteGenres: [],
		favoriteCharacters: [],
		preferredNarrativeStyle: "",
		age: undefined,
		interests: [],
		favoriteBooks: [],
		favoriteMovies: [],
		favoriteGames: [],
		personalityTraits: [],
		preferredThemes: [],
	};

	let currentStep = 1;
	const totalSteps = 4;

	// Predefined options for easy selection
	const genreOptions = [
		"Zero-to-hero narratives",
		"Character growth",
		"Mentorship",
		"Redemption arcs",
		"Found family",
		"Moral complexity",
		"Hidden potential",
		"Coming of age",
		"Epic fantasy",
		"Dark fantasy",
		"Urban fantasy",
		"Slice of life",
	];

	const themeOptions = [
		"Growth through adversity",
		"Mentor/student relationships",
		"Second chances",
		"Awakening power",
		"Difficult choices",
		"Deep bonds",
		"Personal sacrifice",
		"Overcoming the past",
		"Finding purpose",
		"Building community",
	];

	const narrativeStyleOptions = [
		"Deep character development with moral complexity",
		"Fast-paced action with clear objectives",
		"Exploration and discovery focused",
		"Social interaction and relationship building",
		"Strategic combat and tactical challenges",
		"Mystery and investigation driven",
	];

	function toggleArrayItem(array: string[], item: string) {
		const index = array.indexOf(item);
		if (index > -1) {
			array.splice(index, 1);
		} else {
			array.push(item);
		}
		preferences = { ...preferences };
	}

	function nextStep() {
		if (currentStep < totalSteps) {
			currentStep++;
		}
	}

	function prevStep() {
		if (currentStep > 1) {
			currentStep--;
		}
	}

	function completePreferences() {
		playerPreferencesStore.setPreferences(preferences);
		dispatch("complete", preferences);
	}

	function skipPreferences() {
		// Set basic default preferences
		const defaultPreferences: PlayerPreferences = {
			favoriteGenres: ["Character growth", "Zero-to-hero narratives"],
			preferredNarrativeStyle:
				"Deep character development with moral complexity",
			preferredThemes: ["Growth through adversity", "Finding purpose"],
		};

		playerPreferencesStore.setPreferences(defaultPreferences);
		dispatch("skip");
	}
</script>

<div class="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
	<div class="mb-6">
		<h2 class="text-2xl font-bold text-gray-900 mb-2">
			Personalize Your D&D Experience
		</h2>
		<p class="text-gray-600">
			Help us create the perfect campaign for you by sharing your
			preferences.
		</p>

		<!-- Progress bar -->
		<div class="mt-4">
			<div class="flex justify-between text-sm text-gray-500 mb-2">
				<span>Step {currentStep} of {totalSteps}</span>
				<span
					>{Math.round((currentStep / totalSteps) * 100)}% complete</span
				>
			</div>
			<div class="w-full bg-gray-200 rounded-full h-2">
				<div
					class="bg-red-600 h-2 rounded-full transition-all duration-300"
					style="width: {(currentStep / totalSteps) * 100}%"
				></div>
			</div>
		</div>
	</div>

	<!-- Step 1: Basic Info -->
	{#if currentStep === 1}
		<div class="space-y-4">
			<h3 class="text-lg font-semibold">Basic Information</h3>

			<div>
				<label class="block text-sm font-medium text-gray-700 mb-2"
					>Age (optional)</label
				>
				<input
					type="number"
					bind:value={preferences.age}
					class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
					placeholder="Your age"
				/>
			</div>

			<div>
				<label class="block text-sm font-medium text-gray-700 mb-2"
					>Favorite narrative themes</label
				>
				<div class="grid grid-cols-2 gap-2">
					{#each themeOptions as theme}
						<button
							type="button"
							onclick={() =>
								toggleArrayItem(
									preferences.preferredThemes || [],
									theme,
								)}
							class="text-left p-2 rounded border transition-colors {(
								preferences.preferredThemes || []
							).includes(theme)
								? 'bg-red-100 border-red-300 text-red-800'
								: 'bg-gray-50 border-gray-200 hover:bg-gray-100'}"
						>
							{theme}
						</button>
					{/each}
				</div>
			</div>
		</div>
	{/if}

	<!-- Step 2: Favorite Genres -->
	{#if currentStep === 2}
		<div class="space-y-4">
			<h3 class="text-lg font-semibold">Story Preferences</h3>

			<div>
				<label class="block text-sm font-medium text-gray-700 mb-2"
					>What types of stories do you enjoy?</label
				>
				<div class="grid grid-cols-2 gap-2">
					{#each genreOptions as genre}
						<button
							type="button"
							onclick={() =>
								toggleArrayItem(
									preferences.favoriteGenres || [],
									genre,
								)}
							class="text-left p-2 rounded border transition-colors {(
								preferences.favoriteGenres || []
							).includes(genre)
								? 'bg-red-100 border-red-300 text-red-800'
								: 'bg-gray-50 border-gray-200 hover:bg-gray-100'}"
						>
							{genre}
						</button>
					{/each}
				</div>
			</div>

			<div>
				<label class="block text-sm font-medium text-gray-700 mb-2"
					>Preferred narrative style</label
				>
				<div class="space-y-2">
					{#each narrativeStyleOptions as style}
						<button
							type="button"
							onclick={() =>
								(preferences.preferredNarrativeStyle = style)}
							class="w-full text-left p-3 rounded border transition-colors {preferences.preferredNarrativeStyle ===
							style
								? 'bg-red-100 border-red-300 text-red-800'
								: 'bg-gray-50 border-gray-200 hover:bg-gray-100'}"
						>
							{style}
						</button>
					{/each}
				</div>
			</div>
		</div>
	{/if}

	<!-- Step 3: Media Preferences -->
	{#if currentStep === 3}
		<div class="space-y-4">
			<h3 class="text-lg font-semibold">Inspiration Sources</h3>

			<div>
				<label class="block text-sm font-medium text-gray-700 mb-2"
					>Favorite books/series (optional)</label
				>
				<textarea
					bind:value={preferences.favoriteBooks}
					class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
					placeholder="e.g., Harry Potter, Lord of the Rings, Drizzt series..."
					rows="3"
				></textarea>
			</div>

			<div>
				<label class="block text-sm font-medium text-gray-700 mb-2"
					>Favorite movies/shows (optional)</label
				>
				<textarea
					bind:value={preferences.favoriteMovies}
					class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
					placeholder="e.g., Critical Role, Game of Thrones, Marvel movies..."
					rows="3"
				></textarea>
			</div>

			<div>
				<label class="block text-sm font-medium text-gray-700 mb-2"
					>Favorite games (optional)</label
				>
				<textarea
					bind:value={preferences.favoriteGames}
					class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
					placeholder="e.g., Baldur's Gate 3, Skyrim, The Witcher..."
					rows="3"
				></textarea>
			</div>
		</div>
	{/if}

	<!-- Step 4: Review -->
	{#if currentStep === 4}
		<div class="space-y-4">
			<h3 class="text-lg font-semibold">Review Your Preferences</h3>

			<div class="bg-gray-50 p-4 rounded-lg space-y-2">
				{#if preferences.preferredThemes && preferences.preferredThemes.length > 0}
					<p>
						<strong>Themes:</strong>
						{preferences.preferredThemes.join(", ")}
					</p>
				{/if}

				{#if preferences.favoriteGenres && preferences.favoriteGenres.length > 0}
					<p>
						<strong>Genres:</strong>
						{preferences.favoriteGenres.join(", ")}
					</p>
				{/if}

				{#if preferences.preferredNarrativeStyle}
					<p>
						<strong>Style:</strong>
						{preferences.preferredNarrativeStyle}
					</p>
				{/if}
			</div>

			<p class="text-sm text-gray-600">
				These preferences will help our AI create personalized D&D
				campaigns tailored to your interests. You can change them
				anytime in settings.
			</p>
		</div>
	{/if}

	<!-- Navigation buttons -->
	<div class="flex justify-between mt-8">
		<div>
			{#if currentStep > 1}
				<button
					type="button"
					onclick={prevStep}
					class="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
				>
					← Previous
				</button>
			{/if}
		</div>

		<div class="space-x-2">
			<button
				type="button"
				onclick={skipPreferences}
				class="px-4 py-2 text-gray-500 hover:text-gray-700 transition-colors"
			>
				Skip for now
			</button>

			{#if currentStep < totalSteps}
				<button
					type="button"
					onclick={nextStep}
					class="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
				>
					Next →
				</button>
			{:else}
				<button
					type="button"
					onclick={completePreferences}
					class="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
				>
					Complete Setup
				</button>
			{/if}
		</div>
	</div>
</div>
