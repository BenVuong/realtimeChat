<script lang="ts">
  import { currentUser, pb } from "./pocketbase";
  import * as Tabs from "$lib/components/ui/tabs";
  import { Button } from "$lib/components/ui/button";
  let username: string;
  let password: string;

  async function login() {
    await pb.collection("users").authWithPassword(username, password);
  }

  async function signUp() {
    try {
      const data = {
        username,
        password,
        passwordConfirm: password,
      };
      const createdUser = await pb.collection("users").create(data);
      await login();
    } catch (err: any) {
      console.log(err.data);
    }
  }

  function signOut() {
    pb.authStore.clear();
    username = "";
    password = "";
  }
</script>

{#if $currentUser}
  <p>Signed in as {$currentUser.username}</p>
  <Button on:click={signOut}>Sign Out</Button>
{:else}
  <Tabs.Root value="account" class="w-[400px]">
    <Tabs.List class="flex justify-center items-center">
      <Tabs.Trigger value="account">Login</Tabs.Trigger>
      <Tabs.Trigger value="password">Creat an Account</Tabs.Trigger>
    </Tabs.List>
    <Tabs.Content value="account">
      <form on:submit|preventDefault>
        <div class="flex justify-center items-center">
          <input
            placeholder="Enter your username"
            type="text"
            bind:value={username}
          />
          <input
            placeholder="Enter your password"
            type="password"
            minlength="8"
            bind:value={password}
          />
        </div>
        <div class="flex justify-center items-center">
          <Button variant="outline" on:click={login}>Login</Button>
        </div>
      </form>
    </Tabs.Content>
    <Tabs.Content value="password"
      ><form on:submit|preventDefault>
        <div class="flex justify-center items-center">
          <input
            placeholder="Enter your username"
            type="text"
            bind:value={username}
          />
          <input
            placeholder="Enter your password"
            type="password"
            minlength="8"
            bind:value={password}
          />
        </div>
        <div class="flex justify-center items-center">
          <Button variant="outline" on:click={signUp}>Sign Up</Button>
        </div>
      </form></Tabs.Content
    >
  </Tabs.Root>
{/if}
