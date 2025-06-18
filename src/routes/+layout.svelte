<script lang="ts">
	import "../app.css";
	import { Sidebar } from "$lib/components/layout";

	let sidebarOpen = true;

	function toggleSidebar() {
		sidebarOpen = !sidebarOpen;
	}

	function closeSidebar() {
		sidebarOpen = false;
	}
</script>

<!-- Full viewport container without header -->
<div class="h-screen flex overflow-hidden bg-gray-50">
	<!-- Sidebar: 20% width with title integrated -->
	<div
		class="w-1/5 flex-shrink-0 {sidebarOpen ? 'block' : 'hidden'} lg:block"
	>
		<Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
	</div>

	<!-- Main chat area: 80% width -->
	<main class="flex-1 flex flex-col overflow-hidden bg-white">
		<slot />
	</main>
</div>
