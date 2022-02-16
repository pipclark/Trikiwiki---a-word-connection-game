async function answerFetching() {
    const url = "https://trikiwikianswers.herokuapp.com/sendword";
    const response = await fetch(url);
    const todaysanswer = await response.json();
    //console.log(todaysanswer)
    console.log('answer recieved');
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
          //allWords.push(...tags[t].split(/(\s+)/)); // splits at white spaces (space, tab, etc)
          allWords.push(tags[t]); // decided to leave in the full html text because sometimes context is lost when it splits things
          }
      
      // remove anything starting with < or [ to exclude images and  citations and other unwanted references 
      let remove = ['[', '<', '\n', 'the', 'and', 'is', 'of', 'href', '=', ':', 'edit', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '.', '"The', 'In', 'The', 'With', 'with', 'refer', 'link', 'cite', 'sources', 'verification', 'improve this article', 'adding citations to reliable sources', 'newspapers', 'books', 'scholar', 'JSTOR', 'Learn how and when to remove this template message', 'ISBN', '^','Authority control', 'Integrated Authority File (Germany)', '(data)','ISSN','Wayback Machine','Archived']
      for(const r in remove) {
      allWords = arrayRemove(allWords,remove[r]); // r is index
      }
      
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
      console.log('tag matches found');
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
    
    // check if they got the answer and tell them if they did
    if(`${guessInput.value}`.localeCompare(`${answer}`, undefined, { sensitivity: 'base' }) == 0) {
        const winner = [`That's right, you got the answer! The answer was:`, `<a>${answer}</a>`, 'Congratulations, come back tomorrow for more TrikiWiki']
        displayMatches(winner, [], suggestions, guessInput);
        
        
        //do something here to change the css when you win? 
        // set win boolean to true
        
        return true;
        
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
    return false;    
    });
    
    oldMatches.unshift(...matches2); // like push but goes to start of array so that most recent guesses first
    console.log(oldMatches);

    // group duplicate words together so that multiple guesses are shown
    //oldMatches = oldMatches.filter(function(item, pos) { // getting rid of duplicates but keeping as an array
    //    return oldMatches.indexOf(item.word) == pos.word;
    //})
    oldMatches = filterOldMatches(oldMatches);
    
    //console.log(oldMatches, oldMatches[0].guess);
    return false;
  }

  function filterOldMatches(matches){
    for(let j = 0; j<matches.length; j++) {
      for(let i = matches.length-1; i>=0; i--){
        if(i == j){continue;} // don't compare same indexes
        if(matches[j].word == matches[i].word){
          console.log(matches[j], matches[i]);
          if(!matches[j].guess.includes(matches[i].guess)){ // if the guess is not the same
            matches[j].guess = matches[j].guess + ', ' + matches[i].guess;}
            matches.splice(i,1); // remove the duplicate   
        } 
      }
    }; 
  return matches;
  }
    //copies = copies.filter(copy => copy.word == matches[i].word)

  function updatescore(score, numberGuesses){
    score ++;
    numberGuesses.innerHTML = `# guesses: ${score}`;
    return score;
  }

  function revealAnswer(answer,suggestions, oldMatches){
    let reveal = false;
    reveal = window.confirm("Give up and see the answer?")
    
    if(!reveal){return};
    const loser = [`The answer was ${answer}`, 'Better luck next time!']
    displayMatches(loser, oldMatches, suggestions, {value: 'None'});
    var gameOverEvent = new Event('game_over');
    window.dispatchEvent(gameOverEvent);
  }

  function saveScore(score, win, scoreRecord) {
    console.log(win);
    const d = new Date();
    const todaysResult = {
      'wongame': win,
      'guesses': score,
      'day': d.getDate(),
      'month': 1 + d.getMonth(), // january is month 0
      'year': -100 + d.getYear(),  // from 1900
    };
    
    scoreRecord.push(todaysResult);
    localStorage.setItem('scoreRecord', JSON.stringify(scoreRecord));
  }

  function displayStats(scoreRecord){
    // reveal hidden overlay
    const overlay = document.querySelector('.overlay');
    overlay.style.display = 'block';
    overlay.style.top = '15%';
    //overlay.style.height = '80%';

    // bar colours for chart
    let barColors = [];
    for(let i=0; i<scoreRecord.length;i++){
      if(scoreRecord[i].wongame == false) {
        barColors[i] = 'red';
      } else {
        barColors[i]= 'green';
      }
    }
  
  // extract y data and labels (x data)
  let guessdata = []
  scoreRecord.forEach(record => guessdata.push(record.guesses));
  let labels = []
  scoreRecord.forEach(record => labels.push(`${record.day}.${record.month}.${record.year}`));
  
  let result = 'lost';
  if(scoreRecord.at(-1).wongame == true){result = 'won'};
  //console.log(result, scoreRecord.at(-1))
  

  // make stats chart  
  const data = {
    labels: labels,
    datasets: [{
      label: 'Outcome',
      data: guessdata,
      backgroundColor: barColors,
    }]
  };
  
  
  Chart.defaults.font.size = 24;

  const config = {
    type: 'line',
    data: data,
    options: {
      responsive: true,
      scales: {
        y: {
          title: {
            display: true,
            text: 'number of Guesses'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Date'
          }
        }
      },
      plugins: {
        legend: {
            display: true,
            title: {
              
            },
            labels: {
                text: `${result}`,
                color: barColors.at(-1), // text color of last result
                fillStyle: barColors.at(-1), // legend color of last result
                backgroundColor: barColors.at(-1), // text color of last result
            }
        }
      }
    }
  };
  
  const statsChart = new Chart(
    document.getElementById('statsChart'),
    config
  );
    
  }

  function reduceObjectArray(objArray,allowedProperty) {
    const allKeys = Object.keys(objArray);
    const result = allKeys.reduce((next, key) => {
    if (allowedProperty.includes(key)) {
      return { ...next, [key]: objArray[key] };
    } else {
      return next;
    }
  }, {});
  return objArray;
  }

  
  async function main(){
      const answer = await answerFetching()
      //console.log(answer)
      const guessInput = document.querySelector('.guess');
      const guessButton = document.getElementById('guessButton');
      const answerButton = document.getElementById('revealAnswerButton')
      const suggestions = document.querySelector('.suggestions');
      const statsButton = document.getElementById('seeStats');
      var clues = document.getElementsByClassName('clue'); // this is live and will therefore update the array with new clue class additions
      const numberGuesses = document.querySelector('.score');
      var matches = []
      var oldMatches = []
      let score = 0;
      var scoreRecord = JSON.parse(localStorage.getItem('scoreRecord')) || []; // if no score record in local storage returns empty array
      let win = false;
      
    
      const answertags = await tagFetching(answer);
      //console.log(answertags)

      //guessButton.addEventListener('mouseenter',displayStats(scoreRecord));

      window.addEventListener('game_over', function(){
        console.log('gameooooverrr')
        saveScore(score, win, scoreRecord)
        setTimeout(() => {displayStats(scoreRecord)},3000); // stats pop up after 3s from winning
      });

      statsButton.addEventListener('click', function() {
        displayStats(scoreRecord);
      });

    // when hitting submit button
      guessButton.addEventListener("click", async function(event) { 
        guessButton.disabled = true; // stops multiple clicks before guessing complete
            win = await guessing(guessInput,answertags,suggestions,answer,guessButton, oldMatches)
            score = updatescore(score, numberGuesses);  
            guessInput.value = ''; // clear the input field
            //console.log(win);
            if(win){
              var gameOverEvent = new Event('game_over');
              window.dispatchEvent(gameOverEvent)
            };
        
      }); 
    // when pressing enter
      guessInput.addEventListener('keyup', async function(event) { 
      if(event.keyCode ==13) {
            event.disabled = true; 
            win = await guessing(guessInput,answertags,suggestions,answer,guessInput, oldMatches)
            score = updatescore(score, numberGuesses);
            guessInput.value = '';
            if(win){
              var gameOverEvent = new Event('game_over');
              window.dispatchEvent(gameOverEvent)
            };
            
      }
      })

      // guess by Clicking on connections (first needs the clue group updating)
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
            win = await guessing(guess, answertags, suggestions, answer, event, oldMatches);
            score = updatescore(score, numberGuesses);
            if(win){
              var gameOverEvent = new Event('game_over');
              window.dispatchEvent(gameOverEvent)
            };
            
        },);
      }
    }

    answerButton.addEventListener('click', function(event){
      event.disabled = true;  
      revealAnswer(answer,suggestions,oldMatches);
      
    });
    
  }
  
  main().catch(console.log);
  