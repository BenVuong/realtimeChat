# Realtime Chat Application

A simple public chatroom built with Svelte and Pocketbase

## Features

- Users can create an account with a username and password
- Once logged in with an account, users can post a message
- Hovering over a message that the user made will show options for editing the message or deleting it.
- Messages are saved and logged into the Pocketbase SQLite database.

## Note

- Currently for the best experience please use a modern web browser on a computer.
- Since at this moment the pocketbase api is being served by http, chrome will complain about Mixed Content. To bypass the error message and be able to login head to chrome://settings/content/siteDetails?site=https%3A%2F%2Fbenvuong.github.io and change the insecure setting to allow and change the setting: insecure content to allow.
