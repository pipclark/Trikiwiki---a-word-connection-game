async function answerFetching() {
    const url = "https://trikiwikianswers.herokuapp.com/sendword";
    const response = await fetch(url);
    const todaysanswer = await response.json();
    //console.log(todaysanswer)
    console.log('answer recieved')
    return todaysanswer
}

async function tagFetching(word) {
    var url = `https://en.wikipedia.org/w/api.php?action=parse&format=json&origin=*&page=${word}`;
    var tags = []
    var texts = []
    var subtitles = []
    var lists = []
    var allWords = []
  
    const response = await fetch(url);
    json = await response.json();
    html_code = json["parse"]["text"]["*"];
    parser = new DOMParser();
    html = parser.parseFromString(html_code, "text/html"); // this gets you a html document from the pure html
    //var hrefs = html.querySelectorAll(".wikitable");
    //console.log(json)
    var links = html.getElementsByTagName('a'); // gets all the <a links which are hyperlinks
    var texts = html.getElementsByTagName('p'); // gets all the words   
    var subtitles = html.getElementsByTagName('span'); // gets all the sub titles i think            
    var lists = html.getElementsByTagName('li'); // gets all the listed items            
    
    // gets the highlighted word/phrase links you can click on on the page
    for(var i=0, max=links.length; i<max; i++) {
        tags.push(links[i].innerHTML); 
    }
    // gets all the main text content on the page
    /*for(var i=0, max=texts.length; i<max; i++) {
    tags.push(texts[i].innerHTML); 
    }*/
    // gets the subtitles from the page
    /*for(var i=0, max=subtitles.length; i<max; i++) {
        tags.push(subtitles[i].innerHTML); 
        }*/
    // gets all the list items on the page
    /*for(var i=0, max=lists.length; i<max; i++) {
        tags.push(lists[i].innerHTML); 
        }*/
      //console.log(tags)
      //split everything into individual words
      for(t in tags){
          allWords.push(...tags[t].split(/(\s+)/));
          }
      
      // remove anything starting with < or [ to exclude images and  citations and other unwanted references 
      let remove = ['[', '<', ' ', '\n', 'the', 'and', 'a', 'is', 'of', 'href', '=', ':', 'edit', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '.', '"The', 'In', 'The', 'With', 'with', 'refer', 'to', 'link', 'cite', 'sources', 'verification', 'improve this article', 'adding citations to reliable sources', 'news', 'newspapers', 'books', 'scholar', 'JSTOR', 'Learn how and when to remove this template message', 'ISBN', '^','Authority control', 'Integrated Authority File (Germany)', '(data)','ISSN','Wayback Machine','Archived']
      for(const r in remove) {
      allWords = arrayRemove(allWords,remove[r]); // r is index
      }
      //console.log(allWords)
      console.log('wikipedia words recieved')
      return allWords; // define the thing to be returned in the top level of the function and return in it too ;)
  }
  
  
  
  function arrayRemove(arr, values) { 
      return arr.filter(function(ele){ 
          return !ele.includes(values); 
      });
  }
  
  
  function findMatches(array1, array2){
      //finding matches referenced on both pages
      const filteredArray = array1.filter(value => array2.includes(value));
      console.log('tag matches found')
      //console.log(filteredArray)
      return filteredArray;
  }
  
  function displayMatches(matches, oldMatches, suggestions,guessInput) {
      var html = matches.map(clue => {
      //const regex = new RegExp(this.value, 'gi');
      //const connection = clue.replace(regex, `<span class="hl">${this.value}</span>`);
      return `
      <li class="clue" data-clue="${clue}"> 
        ${clue} <span>(guess: ${guessInput.value})</span>
      </li>
        `;
  }).join(''); // turns potential array of multiple items into one big string
  //console.log(html)
  
    html += oldMatches.map(clue => {
          return `
          <li class="clue old" data-clue="${clue.word}"> 
          ${clue.word} <span>(old guess: ${clue.guess})</span>
        </li>
          `;
    }).join('');
  //console.log(html)
  suggestions.innerHTML = html;
  //console.log(matches)
  }

  async function guessing(guessInput,answertags,suggestions,answer,trigger,oldMatches) {
    // increment # guesses score
    
    // check if they got the answer and tell them if they did
    if(`${guessInput.value}`.localeCompare(`${answer}`, undefined, { sensitivity: 'base' }) == 0) {
        const winner = [`That's right, you got the answer!`, `The answer was ${answer}`, 'Congratulations, refresh the page for more trikiwiki']
        displayMatches(winner, [], suggestions, guessInput);
        
        //do something here to change the css when you win? 
        return;
    }
    const guessTags = await tagFetching(guessInput.value)
    var matches = await findMatches(answertags,guessTags)
    matches = matches.filter(function(item, pos) { // getting rid of duplicates but keeping as an array
        return matches.indexOf(item) == pos;
    })
    trigger.disabled = false;
    //console.log(matches)
    displayMatches(matches,oldMatches,suggestions,guessInput)
    // update the oldMatches with new after displaying and add the guess data
    //first make a new array with key values for word and guess so that the guess can be remembered
    const matches2 = matches.map(match => {
        return {word: match, guess: guessInput.value};
    });
    
    oldMatches.unshift(...matches2); // like push but goes to start of array so that most recent guesses first
    
    // this needs changing to make it filter out duplicates now. Right now it just sticks them at the end of the list.
    oldMatches = oldMatches.filter(function(item, pos) { // getting rid of duplicates but keeping as an array
        return oldMatches.indexOf(item.word) == pos.word;
    })
    
    //console.log(oldMatches, oldMatches[0].guess);
    return;
  }

  
  async function main(){
      const answer = await answerFetching()
      //console.log(answer)
      const guessInput = document.querySelector('.guess');
      const guessButton = document.getElementById('guessButton');
      const suggestions = document.querySelector('.suggestions');
      var clues = document.getElementsByClassName('clue'); // this is live and will therefore update the array with new clue class additions
      const numberGuesses = document.querySelector('.score');
      var matches = []
      var oldMatches = []
      let score = 0;
    
      const answertags = await tagFetching(answer);
      //console.log(answertags)
  
    // when hitting submit button
      guessButton.addEventListener("click", async function(event) { 
        guessButton.disabled = true; // stops multiple clicks before guessing complete
            guessing(guessInput,answertags,suggestions,answer,guessButton, oldMatches)
            score ++;
            numberGuesses.innerHTML = `# guesses: ${score}`;
        
      }); 
    // when pressing enter
      guessInput.addEventListener('keyup', async function(event) { 
      if(event.keyCode ==13) {
            event.disabled = true; 
            guessing(guessInput,answertags,suggestions,answer,guessInput, oldMatches)
            score ++;
            numberGuesses.innerHTML = `# guesses: ${score}`;
    
      }
      })

      // reactivate this function with the new clue group
      suggestions.addEventListener('mouseenter', existingClueGuessing) 
      // guess by Clicking on connections
      function existingClueGuessing(){
      for(let i = 0; i < clues.length; i++){
        clues[i].addEventListener('click', async function(event) {
            event.disabled = true;
            // make the valid guess input structure so guessing function can be used
            guess = {
                value: this.dataset.clue,
            };
            guessing(guess, answertags, suggestions, answer, event, oldMatches);
            score ++;
            numberGuesses.innerHTML = `# guesses: ${score}`;
        
            
            
        },);
      }
    }
    
  }
  
  main().catch(console.log);
  