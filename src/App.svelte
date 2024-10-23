<script lang="ts">
  import Login from "./lib/Login.svelte";
  import Messages from "./lib/Messages.svelte";
  import { currentUser } from "./lib/pocketbase";
</script>

<main>
  <h1>Sample Real Time Chat App</h1>

  <div class="card">
    <Login />
  </div>
  {#if $currentUser}
    <Messages />
  {/if}
</main>
