
let currUrl = '';
let lastError = undefined;
const ERROR_WAIT_SECONDS = 40;

// Determines the type of Reddit page based on the URL
const getTypeRedditUpdate = url => {
    if (!url) return 'none';
    if (url.startsWith('https://www.reddit.com/r/') && url.split('/')[5] === 'comments') return 'post' ;
    if (url === 'https://www.reddit.com/' || url.startsWith('https://www.reddit.com/r/')) return 'list';
    return 'unknown'
} 

(() => {
    /**
     * Check and set a global guard variable.
     * If this content script is injected into the same page again,
     * it will do nothing next time.
     */
    if (window.hasRun) {
      return;
    }
    window.hasRun = true;

    // Fetches and adds the upvote ratio percentage to a post
    const queryAddRatio = async (postDiv, href) => {
        
        let divVote = postDiv.shadowRoot?.querySelector('faceplate-number');
        if(!divVote) return;

        const spanDiv = document.createElement("span");
        spanDiv.style.color = "#ff4500";
        spanDiv.classList = divVote.classList;
        spanDiv.id = 'ratioAddon';

        
        if (lastError && (Date.now() - lastError < ERROR_WAIT_SECONDS * 1000)) {
            spanDiv.innerText = ` . NaN`;
            divVote.insertBefore(spanDiv, null);
            return;
        }
        lastError = undefined;

        await fetch(`${href}.json`, {
            credentials: 'omit',
          })
            .then(response => {
                return response.json()
            })
            .then(message => {
                if (!postDiv || !!postDiv.shadowRoot?.querySelector('#ratioAddon')) {
                    return;
                }
                spanDiv.innerText = ` . ${Math.round(message[0].data.children[0].data.upvote_ratio * 100)}%`;
                divVote.insertBefore(spanDiv, null);
            })
            .catch((error) => {
                console.log('ERROR: ', error);
                lastError = Date.now();
            });
    }

    // Updates the upvote ratio percentage for posts in a list view
    const updatePercentageList = async () => {
        const listPost = document.querySelectorAll('shreddit-post');

        for (let postDiv of listPost) {    
            if (!postDiv || !!postDiv.shadowRoot?.querySelector('#ratioAddon')) {
                continue;
            }

            for (let href of postDiv.querySelectorAll('a[href]')){
                if (getTypeRedditUpdate(href.href) === 'post'){
                    await queryAddRatio(postDiv, href.href);
                    break;
                }
            } 

        }

    }

    // Updates the upvote ratio percentage for a single post view
    const updatePercentagePost = () => {
        const redditPost = document.querySelector('shreddit-post') 
        if (!redditPost) return
        queryAddRatio(redditPost, document.URL)
    }

    // Handles tab changes, resetting counters and updating based on new URL
    const changeTab = () => {
        currUrl=document.URL;

        if (getTypeRedditUpdate(document.URL) === 'post') updatePercentagePost();
    };

    // Main function that updates the upvote ratio based on the current URL
    const updatePercentage = () => {
        if (currUrl !== document.URL) changeTab();
        if (getTypeRedditUpdate(document.URL) == 'list') updatePercentageList();
    };

    // Set an interval to periodically update the upvote ratio every 5 seconds
    window.setInterval(function(){
        updatePercentage();
      }, 5000);
  
})();