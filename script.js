document.getElementById('github-form').addEventListener('submit', async function(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const followers = await fetchGitHubUsers(`https://api.github.com/users/${username}/followers`);
    const following = await fetchGitHubUsers(`https://api.github.com/users/${username}/following`);

    const followersSet = new Set(followers.map(user => user.login));
    const followingSet = new Set(following.map(user => user.login));

    const notFollowingBack = Array.from(followingSet).filter(user => !followersSet.has(user));
    const notFollowedBack = Array.from(followersSet).filter(user => !followingSet.has(user));

    displayResults(followers.length, following.length, following.length - followers.length, 'not-following-back', notFollowingBack);
    displayResults(followers.length, following.length, following.length - followers.length, 'not-followed-back', notFollowedBack);
});

async function fetchGitHubUsers(url) {
    let users = [];
    let response = await fetch(url);
    while (response.ok) {
        let data = await response.json();
        users = users.concat(data);
        const linkHeader = response.headers.get('link');
        const nextLink = getNextLink(linkHeader);
        if (nextLink) {
            response = await fetch(nextLink);
        } else {
            break;
        }
    }
    return users;
}

function getNextLink(linkHeader) {
    if (!linkHeader) return null;
    const links = linkHeader.split(',').map(link => link.trim());
    const nextLink = links.find(link => link.includes('rel="next"'));
    return nextLink ? nextLink.split(';')[0].slice(1, -1) : null;
}

function displayResults(followersCount, followingCount, delta, elementId, users) {
    document.getElementById('followed-count').textContent = `The number of users Followed = ${followingCount}`;
    document.getElementById('following-count').textContent = `The number of users Following = ${followersCount}`;
    document.getElementById('delta-count').textContent = `The delta is ${delta}`;

    const ul = document.getElementById(elementId).querySelector('ul');
    ul.innerHTML = '';
    users.forEach(user => {
        const li = document.createElement('li');
        li.textContent = user;
        ul.appendChild(li);
    });
}
