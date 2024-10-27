<script>
  import "./app.css";
  import Login from "./lib/Login.svelte";
  import Messages from "./lib/Messages.svelte";
  import { currentUser } from "./lib/pocketbase";
  import * as Card from "$lib/components/ui/card";
</script>

<main>
  <div class=" flex justify-center items-center content-center">
    <Card.Root>
      <Card.Header class="text-center">
        <Card.Title>Sample Real Time Chat Application</Card.Title>
        <Card.Description>Built using Svelte and Pocketbase</Card.Description>
      </Card.Header>
      <Card.Content>
        <Login></Login>
      </Card.Content>
      <Card.Footer></Card.Footer>
    </Card.Root>
  </div>
  {#if $currentUser}
    <div class="flex justify-center items-center overflow-visible">
      <Messages></Messages>
    </div>
  {/if}
</main>
