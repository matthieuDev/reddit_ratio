
let nbDiv=0;
let currUrl = '';

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

    
    const queryAddRatio = (postDiv, href, currId) => {
        
        let divVote = postDiv.querySelector(`div[id=vote-arrows-${currId}]`);

        if(!divVote) return;

        const spanDiv = document.createElement("span");
        spanDiv.style.color = "#ff4500";
        spanDiv.classList = divVote.children[1].classList;
        spanDiv.id = 'ratioAddon';

        fetch(`${href}.json`)
            .then(response => response.json())
            .then(message => {
                spanDiv.innerText = `${Math.round(message[0].data.children[0].data.upvote_ratio * 100)}%`;
                divVote.insertBefore(spanDiv, divVote.children[2]);
            })
            .catch((error) => {
                console.log('ERROR: ', error);
            });
    }

    const updatePercentageList = () => {
        const divListPostAll = document.querySelectorAll('div[data-scroller-first]');
        const divListPost = divListPostAll[divListPostAll.length - 1]?.parentNode;
        const listPost = divListPost.querySelectorAll(':scope > div');

        if (listPost.length === nbDiv) return;
        nbDiv = listPost.length;

        
        let postDiv;
        for (let post of listPost) {
            postDiv = post?.firstChild?.firstChild;

            
            if (!postDiv || !!postDiv.querySelector('#ratioAddon')) {
                continue;
            }
            

            for (let href of postDiv.querySelectorAll('a[href]')){
                if (getTypeRedditUpdate(href.href) === 'post'){
                    queryAddRatio(postDiv, href.href, postDiv?.id);
                    break;
                }
            } 

        }

    }

    const updatePercentagePost = () => {
        const currId = document.URL.split('/')[6];
        queryAddRatio (document, document.URL, `t3_${currId}`)
    }

    const changeTab = () => {
        nbDiv=0;
        currUrl=document.URL;

        if (getTypeRedditUpdate(document.URL) === 'post') updatePercentagePost();
    };


    
    const updatePercentage = () => {
        if (currUrl !== document.URL) changeTab();
        if (getTypeRedditUpdate(document.URL) == 'list') updatePercentageList();
    };



    window.setInterval(function(){
        updatePercentage();
      }, 5000);
  
})();