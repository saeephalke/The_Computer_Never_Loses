# Welcome to The Computer Never Loses

A rigged game of TicTacToe built with pdd to ensure you'll never ever win, and if you make the wrong first move, you'll never ever draw. 

<img width="1137" height="725" alt="image" src="https://github.com/user-attachments/assets/80c7a1cb-7c63-4bce-98ba-e16c09917d70" />

You see that little box in the corner?

Yeah, that will never reach a number higher than zero as long as the AI is running. 

<img width="198" height="135" alt="image" src="https://github.com/user-attachments/assets/ed760021-582e-4f59-a7a0-aae0486f271f" />


## How it works

Inspired by [this post](https://www.reddit.com/r/howto/comments/c3n3hn/how_to_win_at_tic_tac_toe/), what I've learned is that it's strategically better for the first player to play a corner first. 

In the backend there's a TicTacToe AI trained to always make the best current move. It runs on a minimaxing algorithm, testing out every possibility based on the current board and outputting the index of the next best move. 

The possibilities are weighted, with 0 representing a game that ends with a draw, 1 representing a game that the computer won, and -1 representing a game the player won. It adds the end possibilities of every available move while also putting more weight on games that end earlier. 
The available move with the highest score ends up being the move the AI will pick. 

# PDD

The goal of this project was to learn how to use the [pdd cli tool](https://github.com/promptdriven/pdd?tab=readme-ov-file). The idea of the tool is to make your prompts the source of truth and focus more on writing elaborate prompts than writing code. 
For the backend it was really effective to use the [prompting guideline](https://github.com/promptdriven/pdd/blob/main/docs/prompting_guide.md) as well as the suggested [workflow](https://github.com/promptdriven/pdd?tab=readme-ov-file#pdd-workflows-conceptual-understanding) provided. Lots of unit testing, and reiterations had to be done to ensure both the AI and the server ran properly, and instead of spending time patching code, I regenerated files unless the patch was something as simple as adding an import.
It's a highly recommended tool that suggests for a new way to program in a way that's more prompt-oriented than code-oriented by making your prompts the source of truth: write prompts, generate code, test the code, regenerate the code, update your prompts.

## Takeaways

So you want to win every game of TicTacToe you'll ever play? Just do what the AI does

1. Always play first
2. Always pick a corner
3. Make sure your opponent doesn't play the middle square (you figure this part out)

Enjoy!

   
