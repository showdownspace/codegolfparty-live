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

- On the **Tools** page, you can copy CodinGame’s result screen and paste it into the tools page. It will generate the code that can be pasted into `data.ts`.

  > ![localhost_2427__mode=tools (2)](https://user-images.githubusercontent.com/193136/186494051-348cc310-006e-4a6d-bea0-aa17c986cb08.png)

- To import data and update what’s being displayed, **edit the `data.ts` file.**
