<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { currentUser, pb } from "./pocketbase";
  import * as Card from "$lib/components/ui/card";
  import { Button } from "$lib/components/ui/button";
  import { Textarea } from "$lib/components/ui/textarea";
  import * as HoverCard from "$lib/components/ui/hover-card";

  let messages: any[] = [];
  let newMessage: string;
  let messageContainer;
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

  async function deleteMessage(messageID: string) {
    const deletedMessage = await pb.collection("messages").delete(messageID);
  }
</script>

<Card.Root class="w-2/5">
  <Card.Header class="justify-items-center bg-gray-500">
    <Card.Title>Chat Room</Card.Title>
    <Card.Description class="text-black"
      >Enjoy talking with others</Card.Description
    >
  </Card.Header>
  <Card.Content
    class="h-80 flow-text break-words overflow-y-auto scrollbar-hide bg-white border-2 border-gray-500  shadow-inner"
  >
    <div class="flow-text break-words">
      {#each messages as message (message.id)}
        <div class="py-1">
          <small class="flow-text break-words">
            {message.expand?.user?.username}
            {"["}{message.created}{"]"}:
          </small>
          <div>
            {#if $currentUser?.username == message.expand?.user?.username}
              <HoverCard.Root>
                <HoverCard.Trigger>{message.text}</HoverCard.Trigger>
                <HoverCard.Content>
                  <Button
                    variant="destructive"
                    on:click={() => deleteMessage(message.id)}>Delete</Button
                  >
                </HoverCard.Content>
              </HoverCard.Root>
            {:else}
              {message.text}
            {/if}
          </div>
        </div>
      {/each}
    </div>
  </Card.Content>
  <Card.Footer class=" border-2 border-gray-500">
    <form class="py-3" on:submit|preventDefault={sendMessage}>
      <Textarea placeholder="Message" class=" w-80" bind:value={newMessage} />
      <Button class="bg-black text-white" variant="outline" type="submit"
        >Send</Button
      >
    </form>
  </Card.Footer>
</Card.Root>
