<script lang="ts">
	import { Header, Sidebar, Container } from "$lib/components/layout";

	let sidebarOpen = true; // Default open on desktop

	function toggleSidebar() {
		sidebarOpen = !sidebarOpen;
	}

	function closeSidebar() {
		sidebarOpen = false;
	}
</script>

<!-- Full viewport container -->
<div class="h-screen flex flex-col bg-gray-50">
	<!-- Header spans full width at top -->
	<Header title="D&D Campaign Assistant" onMenuToggle={toggleSidebar} />

	<!-- Main horizontal layout: sidebar + content -->
	<div class="flex flex-1 overflow-hidden">
		<!-- Sidebar: 1/4 width (25%) -->
		<div
			class="w-1/4 flex-shrink-0 {sidebarOpen
				? 'block'
				: 'hidden'} lg:block"
		>
			<Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
		</div>

		<!-- Main content: 3/4 width (75%) -->
		<main class="flex-1 flex flex-col overflow-hidden bg-white">
			<Container padding="none" maxWidth="full">
				<slot />
			</Container>
		</main>
	</div>
</div>
