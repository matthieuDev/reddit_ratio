
let setPost = new Set();
let nbDiv=0;
let currUrl = '';

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

    const resetTab = () => {
        setPost = new Set();
        nbDiv=0;
        currUrl=document.URL;
    };


    const queryAddRatio = (postDiv, href) => {
        
        let curr_id = postDiv?.id;
        let divVote = postDiv.querySelector(`div[id=vote-arrows-${curr_id}]`);

        if(!divVote) return;

        console.log('2222222222222', curr_id);

        const spanDiv = document.createElement("span");
        spanDiv.style.color = "#ff4500";
        spanDiv.classList = divVote.children[1].classList;
        spanDiv.id = 'ratioAddon';

        fetch(`${href}.json`)
            .then(response => response.json())
            .then(message => {
                spanDiv.innerText = `${Math.round(message[0].data.children[0].data.upvote_ratio * 100)}%`;
                divVote.insertBefore(spanDiv, divVote.children[2]);
                console.log('444444444444444', curr_id, message[0].data.children[0].data.name, divVote);
            });
    }
    
    const updatePercentage = () => {

        if (currUrl !== document.URL) resetTab();

        const divListPost = document.querySelector('div[data-scroller-first]')?.parentNode;
        const listPost = divListPost.querySelectorAll(':scope > div');

        if (listPost.length === nbDiv) return;
        nbDiv = listPost.length;

        
        let postDiv, curr_id;
        for (let post of listPost) {
            postDiv = post?.firstChild?.firstChild;
            curr_id = postDiv?.id;

            
            console.log('99999999', curr_id === null , postDiv === null);
            if (curr_id === null || setPost.has(curr_id)) continue;
            // if (curr_id === null || postDiv === null || !!postDiv.querySelector('#ratioAddon')) continue;
            
            setPost.add(curr_id);

            for (let href of postDiv.querySelectorAll('a[href]')){
                if (href.href.startsWith('https://www.reddit.com/r/') && href.href.split('/')[5] === 'comments'){
                    console.log('hrefhrefhrefhrefhref', href.href);
                    queryAddRatio(postDiv, href.href);
                    break;
                }
            } 

        }
    };


    /**
     * Listen for messages from the background script.
    */
    browser.runtime.onMessage.addListener(message => {
        if (message.command === "updatePercentage") {
            updatePercentage();
        } 
    });

  
})();