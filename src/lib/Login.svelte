<script lang="ts">
  import { currentUser, pb } from "./pocketbase";
  import * as Tabs from "$lib/components/ui/tabs";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  let username: string;
  let password: string;

  async function login() {
    try {
      await pb.collection("users").authWithPassword(username, password);
    } catch (err: any) {
      //give user the error message if login has failed
      alert(err.data.message + " Incorrect username or password");
    }
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
      //display error message to user
      //if username is invalid already taken or password length is wrong
      if (err.data.data.password?.message != undefined) {
        alert(err.data.data.password?.message);
      }
      if (err.data.data.username?.message != undefined) {
        alert(err.data.data.username?.message);
      }
    }
  }

  function signOut() {
    pb.authStore.clear();
    username = "";
    password = "";
  }
</script>

{#if $currentUser}
  <div class="text-center">
    <p>Currently signed in as {$currentUser.username}</p>
    <Button on:click={signOut}>Sign Out</Button>
  </div>
{:else}
  <Tabs.Root value="account" class="w-[400px]">
    <Tabs.List class="flex justify-center items-center">
      <Tabs.Trigger value="account">Login</Tabs.Trigger>
      <Tabs.Trigger value="password">Create an Account</Tabs.Trigger>
    </Tabs.List>
    <Tabs.Content value="account">
      <form on:submit|preventDefault>
        <div class="flex justify-center items-center">
          <Input
            placeholder="Enter your username"
            type="text"
            bind:value={username}
          />
          <div class="px-5"></div>
          <Input
            placeholder="Enter your password"
            type="password"
            minlength={8}
            bind:value={password}
          />
        </div>
        <div class="flex justify-center items-center py-4">
          <Button variant="outline" on:click={login}>Login</Button>
        </div>
      </form>
    </Tabs.Content>
    <Tabs.Content value="password"
      ><form on:submit|preventDefault>
        <div class="flex justify-center items-center">
          <Input
            placeholder="Enter your username"
            type="text"
            bind:value={username}
          />
          <div class="px-5"></div>
          <Input
            placeholder="Enter your password"
            type="password"
            minlength={8}
            bind:value={password}
          />
        </div>
        <div class="flex justify-center items-center py-4">
          <Button variant="outline" on:click={signUp}>Sign Up</Button>
        </div>
      </form></Tabs.Content
    >
  </Tabs.Root>
{/if}
