<script lang="ts">
	import "../app.css";
	import { Sidebar } from "$lib/components/layout";

	let sidebarOpen = true;
	let sidebarWidth = 270; // Default width in pixels
	let isResizing = false;
	let startX = 0;
	let startWidth = 0;

	function toggleSidebar() {
		sidebarOpen = !sidebarOpen;
	}

	function closeSidebar() {
		sidebarOpen = false;
	}

	function startResize(event: MouseEvent) {
		isResizing = true;
		startX = event.clientX;
		startWidth = sidebarWidth;

		// Add global event listeners
		document.addEventListener("mousemove", handleResize);
		document.addEventListener("mouseup", stopResize);

		// Prevent text selection during resize
		document.body.style.userSelect = "none";
		document.body.style.cursor = "col-resize";
	}

	function handleResize(event: MouseEvent) {
		if (!isResizing) return;

		const deltaX = event.clientX - startX;
		const newWidth = startWidth + deltaX;

		// Updated constraints: 20% of screen as minimum, 240px as absolute minimum
		const minWidth = Math.max(240, window.innerWidth * 0.1); // 20% of screen or 240px, whichever is larger
		const maxWidth = window.innerWidth * 0.2; // Maximum 50% of screen

		sidebarWidth = Math.max(minWidth, Math.min(newWidth, maxWidth));
	}

	function stopResize() {
		isResizing = false;

		// Remove global event listeners
		document.removeEventListener("mousemove", handleResize);
		document.removeEventListener("mouseup", stopResize);

		// Restore normal cursor and text selection
		document.body.style.userSelect = "";
		document.body.style.cursor = "";
	}

	// Handle double-click to reset to 20% of screen width
	function resetSidebarWidth() {
		sidebarWidth = window.innerWidth * 0.2;
	}
</script>

<!-- Full viewport container without header -->
<div class="h-screen flex overflow-hidden bg-gray-50">
	<!-- Resizable Sidebar -->
	<div
		class="flex-shrink-0 relative {sidebarOpen
			? 'block'
			: 'hidden'} lg:block"
		style="width: {sidebarWidth}px;"
	>
		<Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

		<!-- Subtle Resize Handle -->
		<div
			class="absolute top-0 right-0 w-1 h-full cursor-col-resize group"
			onmousedown={startResize}
			ondblclick={resetSidebarWidth}
			title="Drag to resize sidebar, double-click to reset to 20%"
		>
			<!-- Very subtle visual indicator -->
			<div
				class="w-full h-full bg-gray-200 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
			></div>

			<!-- Minimal grip indicator that only shows on hover -->
			<div
				class="absolute top-1/2 right-0 transform -translate-y-1/2 w-2 h-6 opacity-0 group-hover:opacity-60 transition-opacity duration-200"
			>
				<div
					class="w-0.5 h-full bg-gray-400 rounded-full mx-auto"
				></div>
			</div>
		</div>
	</div>

	<!-- Main chat area: Takes remaining space -->
	<main class="flex-1 flex flex-col overflow-hidden bg-white">
		<slot />
	</main>
</div>
