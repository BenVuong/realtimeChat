<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { currentUser, pb } from "./pocketbase";
  import * as Card from "$lib/components/ui/card";
  import { Button } from "$lib/components/ui/button";
  import { Textarea } from "$lib/components/ui/textarea";
  let messages: any[] = [];
  let newMessage: string;
  let unsubscribe: () => void;
  pb.autoCancellation(false);
  onMount(async () => {
    const resultList = await pb.collection("messages").getList(1, 50, {
      sort: "created",
      expand: "user",
    });
    messages = resultList.items;

    unsubscribe = await pb
      .collection("messages")
      .subscribe("*", async ({ action, record }) => {
        if (action === "create") {
          const user = await pb.collection("users").getOne(record.user);
          record.expand = { user };
          messages = [...messages, record];
        }
        if (action === "delete") {
          messages = messages.filter((m) => m.id !== record.id);
        }
      });
  });

  onDestroy(() => {
    unsubscribe();
  });

  async function sendMessage() {
    const data = {
      text: newMessage,
      user: $currentUser!.id,
    };
    const createdMessage = await pb.collection("messages").create(data);
    newMessage = "";
  }
</script>

<Card.Root>
  <Card.Header>
    <Card.Title>Chat Room</Card.Title>
    <Card.Description>Chat Room Description</Card.Description>
  </Card.Header>
  <Card.Content
    class="h-80 overflow-y-auto scrollbar-hide bg-white border border-gray-200  shadow-inner"
  >
    <div class="messages">
      {#each messages as message (message.id)}
        <div>
          <div>
            {message.expand?.user?.username} : {message.text}
          </div>
        </div>
      {/each}
    </div>
  </Card.Content>
  <Card.Footer>
    <form on:submit|preventDefault={sendMessage}>
      <Textarea placeholder="Message" bind:value={newMessage} />
      <Button class="bg-black text-white" variant="outline" type="submit"
        >Send</Button
      >
    </form>
  </Card.Footer>
</Card.Root>
