import Cookies from 'js-cookie';

export async function fetchGet(url) {
    return fetch(url, {credentials: 'same-origin'});
}

export async function fetchPost(url, postBody, jsonBody = false) {
    let csrftoken = Cookies.get('csrftoken');
    let reqHeaders = new Headers();
    if (csrftoken !== undefined) {
        reqHeaders.append('X-CSRFToken', csrftoken);
    }
    if (jsonBody) {
        postBody = JSON.stringify(postBody);
        reqHeaders.append('Content-Type', 'application/json');
    }

    return fetch(
        url,
        {
            method: 'POST',
            body: postBody,
            credentials: 'same-origin',
            headers: reqHeaders
        }
    );
}
