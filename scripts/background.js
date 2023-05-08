  
const DEFAULT_MAX_POST = 40;
function loadMaxPost () {
    try {
        return parseInt(localStorage.getItem('stop_reddit_inifinite_feed_max_nb_posts')) || DEFAULT_MAX_POST;
    } catch (err) {
        return DEFAULT_MAX_POST
    }
}


let i = 0;
let maxPost = loadMaxPost();
let last_after;

let curr_after ;
let nb_post_next_page ;
let curr_is_passing_threshold ;

let curr_url;

function updatePercentageThen(tabs) {
    browser.tabs.sendMessage(tabs[0].id, {
        command: "updatePercentage",
        maxPost: maxPost,
    });
}
function reportError(error) {
    console.error(`Error: ${error}`);
}

updatePercentage = () => {
    browser.tabs.query({active: true, currentWindow: true})
        .then(updatePercentageThen)
        .catch(reportError);
}



function updatePercentageListenerF(requestDetails) {
    console.log('?????????????', requestDetails.url);
    updatePercentage();
}

browser.webRequest.onBeforeRequest.addListener(
    updatePercentageListenerF,
    {urls: ["https://www.reddit.com/*", "https://preview.redd.it/*"]},
    ["requestBody"],
);
