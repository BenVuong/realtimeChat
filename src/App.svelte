<script>
  import "./app.css";
  import Login from "./lib/Login.svelte";
  import Messages from "./lib/Messages.svelte";
  import { currentUser } from "./lib/pocketbase";
  import * as Card from "$lib/components/ui/card";
</script>

<main>
  <div class=" flex justify-center items-center content-center">
    <div class="image"></div>
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

<style>
  .image {
    position: absolute;
    height: 100%;
    width: 100%;
    top: 0;
    background-image: url("https://external-preview.redd.it/6NSAwHardEpPu3I6cbwfNmYYlj8SXKzkdP7XJ1AnWmA.jpg?auto=webp&s=f8fb70a39ceff6c217b7e22ad1e6fed66b328da9");
    z-index: -1;
  }
</style>
