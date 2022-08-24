# codegolfparty-live

Live scoreboard for Code Golf Party #1.

## Setting up

1. Clone the repository.

2. Install dependencies:

   ```bash
   yarn
   ```

3. Run the development server:

   ```bash
   yarn dev
   ```

4. Go to <http://localhost:2427/>

## Usage

- Controlling what’s displayed on the screen requires changing the code (and then let Vite do its magic).

- First, upon entering, you will see the main menu.

  > ![localhost_2427_](https://user-images.githubusercontent.com/193136/186493298-cd50813f-50f8-4124-9a44-01d9bdbb4cc8.png)

  - **On projector screen,** select "Info Screen (Live)"

  - **On your screen,** select "Tools"

- Check out the **Tools** page:

  > ![localhost_2427__mode=tools (2)](https://user-images.githubusercontent.com/193136/186494051-348cc310-006e-4a6d-bea0-aa17c986cb08.png)

  1. You can copy CodinGame’s result screen and paste it into the tools page. It will generate the code that can be pasted into `data.ts`.
  2. At the bottom left shows the "Preview" screen.
  3. At the bottom right shows the "Live" screen. This is the same as the projector screen.

- To add data and update what’s being displayed, **edit the `data.ts` file.** When saved, the screens will update itself.

   | Method | Description |
   | ------- | ------- |
   | `game.newRound` | Starts a new round. Display the game’s parameter (e.g. modifiers). |
   | `game.play` | Completes the round. Show the detailed scoreboard of the latest round. |
   | `game.showSetRanking` | Show the leaderboard that sums up the score from all the games in the current set. |

   When you call the above methods, it will update the **preview** screen. Add `game.goLive()` to make the live screen show the game state at that point in the code.
