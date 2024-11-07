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
  let shouldScroll = false;
  let totalPages: number;
  let page: number;
  let unsubscribe: () => void;
  pb.autoCancellation(false);
  const userColors = new Map<string, string>();
  // Reference for scrolling to bottom
  let bottomRef: HTMLDivElement | null = null;
  //Read
  onMount(async () => {
    //todo: add pagination in the frontend
    //where it should load 50 of the most recently made messages
    //as you scroll up then it there would a be a button that
    //would load the the next 50 most recently made messages
    //so start from the last page and move backwards
    let resultList = await pb.collection("messages").getList(1, 30, {
      sort: "created",
      expand: "user",
    });

    totalPages = resultList.totalPages;
    shouldScroll = true;
    resultList = await pb.collection("messages").getList(totalPages, 30, {
      sort: "created",
      expand: "user",
    });
    messages = resultList.items;
    page = totalPages;

    console.log(resultList);
    console.log(totalPages);
    unsubscribe = await pb
      .collection("messages")
      .subscribe("*", async ({ action, record }) => {
        if (action === "create") {
          const user = await pb.collection("users").getOne(record.user);
          record.expand = { user };
          messages = [...messages, record];
          shouldScroll = true;
        }

        if (action === "delete") {
          messages = messages.filter((m) => m.id !== record.id);
        }
      });
  });

  onDestroy(() => {
    unsubscribe();
  });

  //autoscroll to the bottom when new message is added
  afterUpdate(() => {
    if (shouldScroll === true) {
      scrollToBottom();
      shouldScroll = false;
    }
  });

  // Scroll to the bottom of the messages list
  function scrollToBottom() {
    bottomRef?.scrollIntoView({ behavior: "smooth" });
  }

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
    const index = messages.findIndex(
      (message) => message.id == editedMessageID
    );
    if (index !== -1) {
      messages[index].text = editedMessage;
    }
    editedMessage = "";
    editMode = false;
  }

  //load the previous page of messages and concat
  //with the current page to make it one long list of messages
  async function loadMore() {
    let resultList = await pb.collection("messages").getList(page - 1, 30, {
      sort: "created",
      expand: "user",
    });
    page = page - 1;
    let list = resultList.items;
    messages = list.concat(messages);
  }

  //Create
  async function sendMessage() {
    const data = {
      text: newMessage,
      user: $currentUser!.id,
    };
    const createdMessage = await pb.collection("messages").create(data);
    newMessage = "";
    scrollToBottom();
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
  <Card.Content>
    <div class="h-80 flow-text break-words overflow-auto scrollbar-hide">
      {#if page > 1}
        <Button on:click={() => loadMore()}>Load more</Button>
      {/if}
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
            {message.text}
            <Button
              class="h-4 px-2 text-sm"
              on:click={() => toggleEdit(message.id, message.text)}>Edit</Button
            >
            <Button
              class="h-4 px-2 text-sm"
              variant="destructive"
              on:click={() => deleteMessage(message.id)}>Delete</Button
            >
          {:else}
            {message.text}
          {/if}
        </div>
      {/each}
      <div bind:this={bottomRef}></div>
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
