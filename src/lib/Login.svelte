<script lang="ts">
  import { currentUser, pb } from "./pocketbase";

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
  <button on:click={signOut}>Sign Out</button>
{:else}
  <form on:submit|preventDefault>
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
    <button on:click={signUp}>Sign Up</button>
    <button on:click={login}>Login</button>
  </form>
{/if}
