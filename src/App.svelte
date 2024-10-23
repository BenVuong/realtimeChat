<script>
  import "./app.css";
  import Login from "./lib/Login.svelte";
  import Messages from "./lib/Messages.svelte";
  import { currentUser } from "./lib/pocketbase";
</script>

<main>
  <h1 class="flex justify-center items-center">Sample Real Time Chat App</h1>

  <div class="flex justify-center items-center">
    <div>
      <Login></Login>
    </div>
  </div>
  {#if $currentUser}
    <div class="flex justify-center items-center overflow-visible">
      <Messages></Messages>
    </div>
  {/if}
</main>
