# Trikiwiki---a-word-connection-game
trying to find the hidden word by trying other words and seeing the connections between your guess and the hidden answer using wikipedia pages

TrikiWiki is currently hosted on netlify at https://admiring-bassi-c82c73.netlify.app/

![trikiwikidemo](https://user-images.githubusercontent.com/94843495/159702944-db05c486-7531-496a-a31f-98fa9bb6c735.png)


TrikiWiki is a webapp using javascript, it retrieves the answer from the trikiwikianswer api (based in python, Flask hosted on heroku), which is a the
title of a valid wikipedia page with more than 100 links on it (code also in my repositories https://github.com/pipclark/trikiwikianswer). Using the 
answer word it will grab  all the titles wikipedia api of wikipedia pages linked to on the answers page from the wikipedia api 
https://www.mediawiki.org/wiki/API:Main_page . 

How you play: enter any word you like, that is likely to have a wikipedia page, and the app will display the pages linked to on both your guess and the answers page.
Keep guessing, either by entering more words, or clicking on the common pages. All your old results, and the guess you entered to find them, are kept on display 
(but in a faded yellow colour instead of the fresh white that new answers get).
Eventually you should be able to narrow down what the answer page is, and if you get it
right, well done! And if you get frustrated and want to give up, you can still find out what the answer was by hitting reveal answer.

The number of guesses it takes you is displayed, and recorded in local storage, so that after winning (or losing) a game you can see your history statistics in a pop over.
You can also see this anytime by hitting the My Stats button at the bottom of the page.

PS Sometimes countries can be misleading, as they could just be linked to in the authority control section of the wikipage, and not really have anything to do with the
answer word. I will remove this, as well as other unuseful words like "Bibcode" in the future!

Have fun. If you manage to get a right answer, I am very proud of you.

