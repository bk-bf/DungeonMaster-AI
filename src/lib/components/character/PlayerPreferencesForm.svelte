<script lang="ts">
	import { playerPreferencesStore } from "$lib/stores/playerPreferences";
	import { createEventDispatcher } from "svelte";
	import type { PlayerPreferences } from "$lib/types/index";

	const dispatch = createEventDispatcher<{
		complete: PlayerPreferences;
		skip: void;
	}>();

	// ✅ ENHANCED: Better prop handling for collaborative mode
	export let collaborativeMode = false;
	export let onBack: (() => void) | null = null;

	let preferences: PlayerPreferences = {};

	// ✅ ENHANCED: Better collaborative fields with validation
	let age: number | undefined = undefined;
	let favoriteMedia = "";
	let heroType = "";

	let currentStep = 1;
	const totalSteps = collaborativeMode ? 1 : 4;

	$: collaborativePreferences = {
		age,
		favoriteGenres: detectGenresFromInput(favoriteMedia, heroType),
		favoriteCharacters: extractCharactersFromHeroType(heroType),
		preferredNarrativeStyle: detectNarrativeStyle(heroType),
		interests: extractInterestsFromMedia(favoriteMedia),
		favoriteBooks: extractBooksFromMedia(favoriteMedia),
		favoriteMovies: extractMoviesFromMedia(favoriteMedia),
		favoriteGames: extractGamesFromMedia(favoriteMedia),
		personalityTraits: extractPersonalityFromHeroType(heroType),
		preferredThemes: detectThemesFromInput(favoriteMedia, heroType),
		// ✅ Store the raw collaborative data
		_collaborativeData: {
			favoriteMedia,
			heroType,
			rawInput: {
				favoriteMedia,
				heroType,
				age,
			},
		},
	} as PlayerPreferences;

	// ✅ ENHANCED: More comprehensive genre options for better character creation
	const genreOptions = [
		"Zero-to-hero narratives",
		"Character growth and development",
		"Mentorship and guidance",
		"Redemption arcs",
		"Found family bonds",
		"Moral complexity and gray areas",
		"Hidden potential discovery",
		"Coming of age stories",
		"Epic high fantasy",
		"Dark fantasy themes",
		"Urban fantasy settings",
		"Political intrigue",
		"Mystery and investigation",
		"Slice of life adventures",
	];

	const themeOptions = [
		"Growth through adversity",
		"Mentor/student relationships",
		"Second chances and redemption",
		"Awakening inner power",
		"Difficult moral choices",
		"Deep emotional bonds",
		"Personal sacrifice for others",
		"Overcoming tragic past",
		"Finding life purpose",
		"Building chosen family",
		"Justice vs. mercy",
		"Power and responsibility",
	];

	const narrativeStyleOptions = [
		"Deep character development with moral complexity",
		"Fast-paced action with clear objectives",
		"Exploration and discovery focused",
		"Social interaction and relationship building",
		"Strategic combat and tactical challenges",
		"Mystery and investigation driven",
		"Political intrigue and diplomacy",
		"Survival and resource management",
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

	// ✅ ENHANCED: Better collaborative preferences building
	function completePreferences() {
		if (collaborativeMode) {
			// ✅ Enhanced collaborative preferences with better data structure
			const collaborativePreferences: PlayerPreferences = {
				age: age,
				favoriteGenres: detectGenresFromInput(favoriteMedia, heroType),
				favoriteCharacters: extractCharactersFromHeroType(heroType),
				preferredNarrativeStyle: detectNarrativeStyle(heroType),
				interests: extractInterestsFromMedia(favoriteMedia),
				favoriteBooks: extractBooksFromMedia(favoriteMedia),
				favoriteMovies: extractMoviesFromMedia(favoriteMedia),
				favoriteGames: extractGamesFromMedia(favoriteMedia),
				personalityTraits: extractPersonalityFromHeroType(heroType),
				preferredThemes: detectThemesFromInput(favoriteMedia, heroType),
			};

			console.log(
				"🎭 Collaborative preferences built:",
				collaborativePreferences,
			);
			playerPreferencesStore.setPreferences(collaborativePreferences);
			dispatch("complete", collaborativePreferences);
		} else {
			// Traditional mode - use existing preferences
			playerPreferencesStore.setPreferences(preferences);
			dispatch("complete", preferences);
		}
	}

	// ✅ NEW: Helper functions for intelligent parsing
	function extractBooksFromMedia(media: string): string[] {
		const bookKeywords = [
			"book",
			"novel",
			"series",
			"tolkien",
			"harry potter",
			"dune",
			"game of thrones",
			"wheel of time",
			"brandon sanderson",
		];
		const lowerMedia = media.toLowerCase();
		const books: string[] = [];

		bookKeywords.forEach((keyword) => {
			if (lowerMedia.includes(keyword)) {
				// Extract context around the keyword
				const sentences = media.split(/[.!?]/);
				sentences.forEach((sentence) => {
					if (sentence.toLowerCase().includes(keyword)) {
						books.push(sentence.trim());
					}
				});
			}
		});

		return books.length > 0 ? books : [media]; // Fallback to full media string
	}

	function extractMoviesFromMedia(media: string): string[] {
		const movieKeywords = [
			"movie",
			"film",
			"show",
			"series",
			"marvel",
			"disney",
			"netflix",
			"hbo",
		];
		const lowerMedia = media.toLowerCase();
		const movies: string[] = [];

		movieKeywords.forEach((keyword) => {
			if (lowerMedia.includes(keyword)) {
				const sentences = media.split(/[.!?]/);
				sentences.forEach((sentence) => {
					if (sentence.toLowerCase().includes(keyword)) {
						movies.push(sentence.trim());
					}
				});
			}
		});

		return movies.length > 0 ? movies : [media];
	}

	function extractGamesFromMedia(media: string): string[] {
		const gameKeywords = [
			"game",
			"rpg",
			"baldur",
			"skyrim",
			"witcher",
			"dragon age",
			"final fantasy",
			"zelda",
		];
		const lowerMedia = media.toLowerCase();
		const games: string[] = [];

		gameKeywords.forEach((keyword) => {
			if (lowerMedia.includes(keyword)) {
				const sentences = media.split(/[.!?]/);
				sentences.forEach((sentence) => {
					if (sentence.toLowerCase().includes(keyword)) {
						games.push(sentence.trim());
					}
				});
			}
		});

		return games.length > 0 ? games : [];
	}

	function extractCharactersFromHeroType(heroType: string): string[] {
		// Extract character archetypes mentioned
		const archetypes = [
			"rogue",
			"paladin",
			"wizard",
			"warrior",
			"ranger",
			"bard",
			"cleric",
		];
		const characters: string[] = [];

		archetypes.forEach((archetype) => {
			if (heroType.toLowerCase().includes(archetype)) {
				characters.push(archetype);
			}
		});

		return characters;
	}

	function detectGenresFromInput(media: string, heroType: string): string[] {
		const combined = `${media} ${heroType}`.toLowerCase();
		const detectedGenres: string[] = [];

		// Map keywords to genres
		const genreMap = {
			"Zero-to-hero narratives": [
				"zero to hero",
				"underdog",
				"rise",
				"humble",
				"growth",
			],
			"Character growth and development": [
				"growth",
				"development",
				"change",
				"evolve",
				"journey",
			],
			"Redemption arcs": [
				"redemption",
				"second chance",
				"atone",
				"forgiveness",
				"past",
			],
			"Found family bonds": [
				"family",
				"friendship",
				"bonds",
				"team",
				"companions",
			],
			"Moral complexity and gray areas": [
				"complex",
				"moral",
				"difficult",
				"gray",
				"choice",
			],
			"Epic high fantasy": [
				"fantasy",
				"magic",
				"epic",
				"medieval",
				"tolkien",
				"dragons",
			],
			"Mystery and investigation": [
				"mystery",
				"detective",
				"investigate",
				"solve",
				"clues",
			],
		};

		Object.entries(genreMap).forEach(([genre, keywords]) => {
			if (keywords.some((keyword) => combined.includes(keyword))) {
				detectedGenres.push(genre);
			}
		});

		// Default genres if none detected
		return detectedGenres.length > 0
			? detectedGenres
			: ["Character growth and development", "Zero-to-hero narratives"];
	}

	function detectNarrativeStyle(heroType: string): string {
		const lowerHeroType = heroType.toLowerCase();

		if (
			lowerHeroType.includes("complex") ||
			lowerHeroType.includes("moral")
		) {
			return "Deep character development with moral complexity";
		} else if (
			lowerHeroType.includes("action") ||
			lowerHeroType.includes("fight")
		) {
			return "Fast-paced action with clear objectives";
		} else if (
			lowerHeroType.includes("explore") ||
			lowerHeroType.includes("discover")
		) {
			return "Exploration and discovery focused";
		} else if (
			lowerHeroType.includes("social") ||
			lowerHeroType.includes("charm")
		) {
			return "Social interaction and relationship building";
		}

		return "Deep character development with moral complexity"; // Default
	}

	function detectThemesFromInput(media: string, heroType: string): string[] {
		const combined = `${media} ${heroType}`.toLowerCase();
		const detectedThemes: string[] = [];

		const themeMap = {
			"Growth through adversity": [
				"growth",
				"challenge",
				"overcome",
				"struggle",
			],
			"Finding life purpose": [
				"purpose",
				"meaning",
				"destiny",
				"calling",
			],
			"Second chances and redemption": [
				"redemption",
				"second chance",
				"forgiveness",
			],
			"Building chosen family": [
				"family",
				"friendship",
				"bonds",
				"community",
			],
			"Justice vs. mercy": ["justice", "mercy", "right", "wrong"],
			"Power and responsibility": [
				"power",
				"responsibility",
				"burden",
				"duty",
			],
		};

		Object.entries(themeMap).forEach(([theme, keywords]) => {
			if (keywords.some((keyword) => combined.includes(keyword))) {
				detectedThemes.push(theme);
			}
		});

		return detectedThemes.length > 0
			? detectedThemes
			: ["Growth through adversity", "Finding life purpose"];
	}

	function extractPersonalityFromHeroType(heroType: string): string[] {
		const traits: string[] = [];
		const lowerHeroType = heroType.toLowerCase();

		if (lowerHeroType.includes("clever") || lowerHeroType.includes("smart"))
			traits.push("Clever");
		if (lowerHeroType.includes("noble") || lowerHeroType.includes("honor"))
			traits.push("Noble");
		if (
			lowerHeroType.includes("curious") ||
			lowerHeroType.includes("explore")
		)
			traits.push("Curious");
		if (lowerHeroType.includes("kind") || lowerHeroType.includes("heart"))
			traits.push("Kind-hearted");
		if (
			lowerHeroType.includes("brave") ||
			lowerHeroType.includes("courage")
		)
			traits.push("Brave");

		return traits.length > 0 ? traits : ["Determined"];
	}

	function extractInterestsFromMedia(media: string): string[] {
		const interests: string[] = [];
		const lowerMedia = media.toLowerCase();

		if (lowerMedia.includes("magic") || lowerMedia.includes("fantasy"))
			interests.push("Magic and Fantasy");
		if (lowerMedia.includes("adventure") || lowerMedia.includes("quest"))
			interests.push("Adventure");
		if (lowerMedia.includes("mystery") || lowerMedia.includes("detective"))
			interests.push("Mystery");
		if (
			lowerMedia.includes("romance") ||
			lowerMedia.includes("relationship")
		)
			interests.push("Romance");
		if (lowerMedia.includes("action") || lowerMedia.includes("combat"))
			interests.push("Action");

		return interests;
	}

	function skipPreferences() {
		// Set basic default preferences
		const defaultPreferences: PlayerPreferences = {
			favoriteGenres: [
				"Character growth and development",
				"Zero-to-hero narratives",
			],
			preferredNarrativeStyle:
				"Deep character development with moral complexity",
			preferredThemes: [
				"Growth through adversity",
				"Finding life purpose",
			],
		};

		playerPreferencesStore.setPreferences(defaultPreferences);
		dispatch("skip");
	}

	// ✅ NEW: Validation helpers
	$: isCollaborativeFormValid = collaborativeMode
		? favoriteMedia.trim().length > 0 || heroType.trim().length > 0
		: true;

	$: formCompletionText = collaborativeMode
		? "Start Character Creation"
		: "Complete Setup";
</script>

<div class="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
	<div class="mb-6">
		<h2 class="text-2xl font-bold text-gray-900 mb-2">
			{collaborativeMode
				? "Tell Us About Your Story Preferences"
				: "Personalize Your D&D Experience"}
		</h2>
		<p class="text-gray-600">
			{collaborativeMode
				? "Share some quick preferences so we can create the perfect character together!"
				: "Help us create the perfect campaign for you by sharing your preferences."}
		</p>

		<!-- ✅ CONDITIONAL PROGRESS BAR -->
		{#if !collaborativeMode}
			<!-- Progress bar -->
			<div class="mt-4">
				<div class="flex justify-between text-sm text-gray-500 mb-2">
					<span>Step {currentStep} of {totalSteps}</span>
					<span
						>{Math.round((currentStep / totalSteps) * 100)}%
						complete</span
					>
				</div>
				<div class="w-full bg-gray-200 rounded-full h-2">
					<div
						class="bg-red-600 h-2 rounded-full transition-all duration-300"
						style="width: {(currentStep / totalSteps) * 100}%"
					></div>
				</div>
			</div>
		{/if}
	</div>

	<!-- ✅ ENHANCED COLLABORATIVE MODE FORM -->
	{#if collaborativeMode}
		<div class="space-y-6">
			<div>
				<label
					for="collab-age"
					class="block text-sm font-medium text-gray-700 mb-2"
					>Age (optional)</label
				>
				<input
					id="collab-age"
					bind:value={age}
					type="number"
					min="13"
					max="100"
					class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
					placeholder="Your age (helps us tailor the experience)"
				/>
			</div>

			<div>
				<label
					for="collab-media"
					class="block text-sm font-medium text-gray-700 mb-2"
					>Favorite Stories & Media</label
				>
				<textarea
					id="collab-media"
					bind:value={favoriteMedia}
					class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
					rows="4"
					placeholder="What stories do you love? List books, movies, shows, games, etc.&#10;&#10;Examples:&#10;• Lord of the Rings, Harry Potter&#10;• Marvel movies, Game of Thrones&#10;• Baldur's Gate 3, The Witcher&#10;• Critical Role, D&D podcasts"
				></textarea>
				<p class="text-xs text-gray-500 mt-1">
					✨ This helps us understand the tone, themes, and
					storytelling style you enjoy
				</p>
			</div>

			<div>
				<label
					for="collab-hero"
					class="block text-sm font-medium text-gray-700 mb-2"
					>Your Ideal Hero</label
				>
				<textarea
					id="collab-hero"
					bind:value={heroType}
					class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
					rows="4"
					placeholder="Describe the type of character you'd love to play...&#10;&#10;Examples:&#10;• A clever rogue with a heart of gold seeking redemption&#10;• A noble paladin struggling with difficult moral choices&#10;• A curious wizard uncovering dangerous ancient secrets&#10;• A brave warrior protecting those who can't protect themselves"
				></textarea>
				<p class="text-xs text-gray-500 mt-1">
					🎭 Don't worry about D&D mechanics - just describe the
					character archetype and story that excites you!
				</p>
			</div>
		</div>

		<div class="flex justify-between items-center mt-8">
			{#if onBack}
				<button
					type="button"
					on:click={onBack}
					class="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
				>
					← Back
				</button>
			{:else}
				<button
					type="button"
					on:click={skipPreferences}
					class="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
				>
					Skip for now
				</button>
			{/if}

			<button
				type="button"
				on:click={completePreferences}
				disabled={!isCollaborativeFormValid}
				class="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
			>
				{formCompletionText}
			</button>
		</div>
	{:else}
		<!-- Traditional detailed form steps -->
		{#if currentStep === 1}
			<!-- Step 1: Favorite Genres -->
			<div class="space-y-4">
				<div>
					<h3 class="text-lg font-semibold text-gray-900 mb-3">
						What kinds of stories do you enjoy?
					</h3>
					<p class="text-sm text-gray-600 mb-4">
						Select all that apply to help us understand your
						preferences.
					</p>
					<div class="grid grid-cols-1 md:grid-cols-2 gap-3">
						{#each genreOptions as genre}
							<label
								class="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
							>
								<input
									type="checkbox"
									checked={preferences.favoriteGenres?.includes(
										genre,
									) ?? false}
									on:change={() =>
										toggleArrayItem(
											preferences.favoriteGenres || [],
											genre,
										)}
									class="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
								/>
								<span class="text-sm text-gray-700"
									>{genre}</span
								>
							</label>
						{/each}
					</div>
				</div>
			</div>
		{:else if currentStep === 2}
			<!-- Step 2: Preferred Themes -->
			<div class="space-y-4">
				<div>
					<h3 class="text-lg font-semibold text-gray-900 mb-3">
						What themes resonate with you?
					</h3>
					<p class="text-sm text-gray-600 mb-4">
						Choose themes that make stories meaningful to you.
					</p>
					<div class="grid grid-cols-1 md:grid-cols-2 gap-3">
						{#each themeOptions as theme}
							<label
								class="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
							>
								<input
									type="checkbox"
									checked={preferences.preferredThemes?.includes(
										theme,
									) ?? false}
									on:change={() =>
										toggleArrayItem(
											preferences.preferredThemes || [],
											theme,
										)}
									class="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
								/>
								<span class="text-sm text-gray-700"
									>{theme}</span
								>
							</label>
						{/each}
					</div>
				</div>
			</div>
		{:else if currentStep === 3}
			<!-- Step 3: Narrative Style -->
			<div class="space-y-4">
				<div>
					<h3 class="text-lg font-semibold text-gray-900 mb-3">
						What storytelling style do you prefer?
					</h3>
					<p class="text-sm text-gray-600 mb-4">
						Choose the narrative approach that appeals to you most.
					</p>
					<div class="space-y-3">
						{#each narrativeStyleOptions as style}
							<label
								class="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
							>
								<input
									type="radio"
									bind:group={
										preferences.preferredNarrativeStyle
									}
									value={style}
									class="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
								/>
								<span class="text-sm text-gray-700"
									>{style}</span
								>
							</label>
						{/each}
					</div>
				</div>
			</div>
		{:else if currentStep === 4}
			<!-- Step 4: Personal Info -->
			<div class="space-y-4">
				<div>
					<h3 class="text-lg font-semibold text-gray-900 mb-3">
						Tell us a bit about yourself
					</h3>
					<p class="text-sm text-gray-600 mb-4">
						This helps us create a more personalized experience.
					</p>

					<div class="space-y-4">
						<div>
							<label
								for="age"
								class="block text-sm font-medium text-gray-700 mb-2"
							>
								Age (optional)
							</label>
							<input
								id="age"
								bind:value={preferences.age}
								type="number"
								min="13"
								max="100"
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
								placeholder="Your age"
							/>
						</div>

						<div>
							<label
								class="block text-sm font-medium text-gray-700 mb-2"
							>
								Favorite media (optional)
							</label>
							<textarea
								bind:value={preferences.favoriteBooks}
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
								rows="3"
								placeholder="Books, movies, games, shows you love..."
							></textarea>
						</div>
					</div>
				</div>
			</div>
		{/if}

		<!-- Navigation buttons for traditional mode -->
		<div class="flex justify-between items-center mt-8">
			{#if currentStep === 1}
				<button
					type="button"
					on:click={skipPreferences}
					class="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
				>
					Skip for now
				</button>
			{:else}
				<button
					type="button"
					on:click={prevStep}
					class="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
				>
					← Previous
				</button>
			{/if}

			{#if currentStep === totalSteps}
				<button
					type="button"
					on:click={completePreferences}
					class="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
				>
					Complete Setup
				</button>
			{:else}
				<button
					type="button"
					on:click={nextStep}
					class="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
				>
					Next →
				</button>
			{/if}
		</div>
	{/if}
</div>
