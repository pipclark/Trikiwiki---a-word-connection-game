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
  
    const response = await fetch(url);
    json = await response.json();
      html_code = json["parse"]["text"]["*"];
      parser = new DOMParser();
      html = parser.parseFromString(html_code, "text/html"); // this gets you a html document from the pure html
      //var hrefs = html.querySelectorAll(".wikitable");
      //console.log(json)
      var links = html.getElementsByTagName('a'); // gets all the <a links which are hyperlinks            
      for(var i=0, max=links.length; i<max; i++) {
          tags.push(links[i].innerHTML); // gets the highlighted word/phrase to you can click on on the page
      }
      // remove anything starting with < or [ to exclude images and  citations and other unwanted references 
      let remove = ['[', '<', 'edit', 'verification', 'improve this article', 'adding citations to reliable sources', 'news', 'newspapers', 'books', 'scholar', 'JSTOR', 'Learn how and when to remove this template message', 'ISBN', '^','Authority control', 'Integrated Authority File (Germany)', '(data)','ISSN','Wayback Machine','Archived']
      for(const r in remove) {
      tags = arrayRemove(tags,remove[r]); // r is index
      }
      //console.log(tags)
      console.log('wikipedia tags recieved')
      return tags; // define the thing to be returned in the top level of the function and return in it too ;)
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
      console.log(filteredArray)
      return filteredArray;
  }
  
  function displayMatches(matches, suggestions) {
      const html = matches.map(clue => {
      //const regex = new RegExp(this.value, 'gi');
      //const connection = clue.replace(regex, `<span class="hl">${this.value}</span>`);
      return `
      <li>
        <span class="name">${clue}</span>
      </li>
        `;
  }).join(''); // turns potential array of multiple items into one big string, which in this case gets rid a comma on a line between each place
  suggestions.innerHTML = html;
  }

  async function guessing(guessInput,answertags,suggestions,answer) {
    // first check if they got the answer and tell them if they did
    if(`${guessInput.value}`.localeCompare(`${answer}`, undefined, { sensitivity: 'base' }) == 0) {
        const winner = [`That's right, you got the answer!`, `Today's answer was ${answer}`, 'Congratulations, come back tomorrow for more trikiwiki']
        displayMatches(winner,suggestions);
        return;
    }
    const guessTags = await tagFetching(guessInput.value)
    var matches = await findMatches(answertags,guessTags)
    matches = matches.filter(function(item, pos) { // getting rid of duplicates but keeping as an array
        return matches.indexOf(item) == pos;
    })
    //console.log(matches)
    displayMatches(matches,suggestions)
  }

  
  async function main(){
      const answer = await answerFetching()
      //console.log(answer)
      const guessInput = document.querySelector('.guess');
      const guessButton = document.getElementById('guessButton');
      const suggestions = document.querySelector('.suggestions')
      var matches = []
  
      const answertags = await tagFetching(answer);
      //console.log(answertags)//.includes('Wine'));
  
      guessButton.addEventListener("click", async function(event) { // when hitting submit button
            guessing(guessInput,answertags,suggestions,answer)
      }); 
  
      guessInput.addEventListener('keyup', function(event) { // when pressing enter
      if(event.keyCode ==13) {
            guessing(guessInput,answertags,suggestions,answer)

      }
      
      })
  
    
  }
  
  main().catch(console.log);
  