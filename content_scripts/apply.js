let intervalFunctionId;

// Determines the type of Reddit page based on the URL
const getTypeRedditUpdate = url => {
    if (!url) return 'none';
    if (url.startsWith('https://www.reddit.com/r/') && url.split('/')[5] === 'comments') return 'post';
    if (url === 'https://www.reddit.com/' || url.startsWith('https://www.reddit.com/r/')) return 'list';
    return 'unknown'
}

    // Fetches and adds the upvote ratio percentage to a post
const queryratio = async (divVote, href, button) => {
    const spanDiv = document.createElement("span");
    spanDiv.style.color = "#ff4500";
    spanDiv.classList = divVote.classList;
    spanDiv.id = 'ratioAddon';

    await fetch(`${href}.json`, {
        credentials: 'omit',
    })
        .then(response => {
            return response.json()
        })
        .then(message => {
            if (!divVote || !!divVote.shadowRoot?.querySelector('#ratioAddon')) {
                return;
            }
            spanDiv.innerText = ` . ${Math.round(message[0].data.children[0].data.upvote_ratio * 100)}%`;
            divVote.insertBefore(spanDiv, null);
            button.remove();
        })
        .catch((error) => {
            console.log('ERROR: ', error);
            lastError = Date.now();
        });

}

// Fetches and adds the upvote ratio percentage to a post
const addRatioButton = (postDiv, href) => {

    let divVote = postDiv.shadowRoot?.querySelector('faceplate-number');
    if (!divVote) return;

    const button = document.createElement("button");
    button.style.color = "#ff4500";
    button.style['margin-left'] = "5px";
    button.classList = divVote.classList;
    button.id = 'ratioButtonAddon';
    button.innerText = '%';
    button.addEventListener("click", () => queryratio(divVote, href, button));

    divVote.insertBefore(button, null);
}

// Updates the upvote ratio percentage for posts in a list view
const updatePercentageList = async () => {
    const listPost = document.querySelectorAll('shreddit-post');

    for (let postDiv of listPost) {
        if (!postDiv || !!postDiv.shadowRoot?.querySelector('#ratioAddon') || !!postDiv.shadowRoot?.querySelector('#ratioButtonAddon')) {
            continue;
        }

        for (let href of postDiv.querySelectorAll('a[href]')) {
            if (getTypeRedditUpdate(href.href) === 'post') {
                addRatioButton(postDiv, href.href);
                break;
            }
        }

    }

}

// Updates the upvote ratio percentage for a single post view
const updatePercentagePost = () => {
    const redditPost = document.querySelector('shreddit-post');
    if (!redditPost) return;
    addRatioButton(redditPost, document.URL);
    window.clearInterval(intervalFunctionId);
}

const addAllRatioButton = () => {
    switch (getTypeRedditUpdate(document.URL)) {
        case 'list':
            updatePercentageList();
            break;
        case 'post':
            updatePercentagePost();
            break;
    }
};

// Set an interval to periodically update the upvote ratio every 5 seconds
intervalFunctionId = window.setInterval(function () {
    addAllRatioButton();
}, 3000);
addAllRatioButton();
