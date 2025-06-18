<script lang="ts">
    import { Header } from "$lib/components/layout";
    import { Button, Input, Card } from "$lib/components/ui";

    let testInput = "";
    let sidebarOpen = false;
</script>

<div class="p-8 space-y-8">
    <h1 class="text-2xl font-bold">Component Testing Page</h1>

    <!-- Test Header Component -->
    <section class="bg-red-100 p-4 border-2 border-red-500">
        <h2 class="text-lg font-semibold mb-2">Header Component Test</h2>
        <Header
            title="Test Header"
            onMenuToggle={() => console.log("Menu toggled")}
        />
    </section>

    <!-- Test Button Component -->
    <section class="bg-blue-100 p-4 border-2 border-blue-500">
        <h2 class="text-lg font-semibold mb-2">Button Component Test</h2>
        <Button variant="primary" size="md">Test Button</Button>
    </section>

    <!-- Test Input Component -->
    <section class="bg-green-100 p-4 border-2 border-green-500">
        <h2 class="text-lg font-semibold mb-2">Input Component Test</h2>
        <Input bind:value={testInput} placeholder="Test input..." />
        <p>Current value: {testInput}</p>
    </section>

    <!-- Test Card Component -->
    <section class="bg-yellow-100 p-4 border-2 border-yellow-500">
        <h2 class="text-lg font-semibold mb-2">Card Component Test</h2>
        <Card title="Test Card">
            <p>This is test content inside the card.</p>
        </Card>
    </section>
</div>
