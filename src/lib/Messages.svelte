<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { currentUser, pb } from "./pocketbase";

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

<div class="messages">
  {#each messages as message (message.id)}
    <div>
      <div>
        {message.text}
      </div>
      <small>
        Sent by User: {message.expand?.user?.username}
      </small>
    </div>
  {/each}
</div>

<form on:submit|preventDefault={sendMessage}>
  <input placeholder="Message" type="text" bind:value={newMessage} />
  <button type="submit">Send</button>
</form>
