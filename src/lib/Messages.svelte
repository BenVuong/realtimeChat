<script lang="ts">
  import { onMount, onDestroy, afterUpdate } from "svelte";
  import { currentUser, pb } from "./pocketbase";
  import * as Card from "$lib/components/ui/card";
  import { Button } from "$lib/components/ui/button";
  import { Textarea } from "$lib/components/ui/textarea";
  import * as HoverCard from "$lib/components/ui/hover-card";
  let messages: any[] = [];
  let newMessage: string;
  let editMode = false;
  let editedMessage: string;
  let editedMessageID: string;
  let unsubscribe: () => void;
  pb.autoCancellation(false);
  const userColors = new Map<string, string>();

  //Read
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

        if (action === "update") {
          const resultList = await pb.collection("messages").getList(1, 50, {
            sort: "created",
            expand: "user",
          });
          messages = resultList.items;
        }

        if (action === "delete") {
          messages = messages.filter((m) => m.id !== record.id);
        }
      });
  });

  onDestroy(() => {
    unsubscribe();
  });

  function toggleEdit(messageID: string, text: string) {
    editMode = !editMode;
    if (editMode === true) {
      editedMessageID = messageID;
      editedMessage = text;
    } else {
      editedMessageID = "";
      editedMessage = "";
    }
  }

  //Update
  async function editMessage() {
    const data = {
      text: editedMessage,
      user: $currentUser!.id,
    };
    const updateMessage = await pb
      .collection("messages")
      .update(editedMessageID, data);
    editedMessage = "";
    editMode = false;
  }

  //Create
  async function sendMessage() {
    const data = {
      text: newMessage,
      user: $currentUser!.id,
    };
    const createdMessage = await pb.collection("messages").create(data);
    newMessage = "";
  }

  //Delete
  async function deleteMessage(messageID: string) {
    const deletedMessage = await pb.collection("messages").delete(messageID);
  }

  //generate a random hex color code
  function getRandomColor() {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  // assigns color to a username or get color of username if already assigned
  function getColorForUser(username: string) {
    if (!userColors.has(username)) {
      userColors.set(username, getRandomColor());
    }
    return userColors.get(username);
  }

  //quality of life feature
  //users can now press enter on key to submit text
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault(); // Prevents adding a new line
      if (editMode === false) {
        sendMessage();
      } else if (editMode === true) {
        editMessage();
      }
    }
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
    class="h-80 flow-text break-words overflow-auto scrollbar-hide bg-white border-2 border-gray-500  shadow-inner"
  >
    <div class="break-words">
      {#each messages as message (message.id)}
        <div class="pt-1">
          <small class="flow-text break-words">
            <div
              style="color: {getColorForUser(message.expand?.user?.username)}"
            >
              {message.expand?.user?.username}
              {"["}{message.created}{"]"}:
            </div>
          </small>

          {#if $currentUser?.username == message.expand?.user?.username}
            <HoverCard.Root>
              <HoverCard.Trigger>{message.text}</HoverCard.Trigger>
              <HoverCard.Content>
                <Button
                  variant="destructive"
                  on:click={() => deleteMessage(message.id)}>Delete</Button
                >
                <Button on:click={() => toggleEdit(message.id, message.text)}
                  >Edit</Button
                >
              </HoverCard.Content>
            </HoverCard.Root>
          {:else}
            {message.text}
          {/if}
        </div>
      {/each}
    </div>
  </Card.Content>
  <Card.Footer class=" border-2 border-gray-500">
    {#if editMode}
      <form class="py-3" on:submit|preventDefault={editMessage}>
        <Textarea
          class=" w-80"
          bind:value={editedMessage}
          on:keydown={handleKeydown}
        />
        <Button class="bg-black text-white" variant="outline" type="submit"
          >Edit Message</Button
        >
        <Button on:click={() => toggleEdit("", "")}>Cancel</Button>
      </form>
    {:else}
      <form class="py-3" on:submit|preventDefault={sendMessage}>
        <Textarea
          placeholder="Message"
          class=" w-80"
          bind:value={newMessage}
          on:keydown={handleKeydown}
        />
        <Button class="bg-black text-white" variant="outline" type="submit"
          >Send</Button
        >
      </form>
    {/if}
  </Card.Footer>
</Card.Root>
