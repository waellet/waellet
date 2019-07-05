const shuffleArray = (array) => {
    let currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
};

const convertToAE = (balance) => {
    return +(balance / 10 ** 18).toFixed(7);
};

const extractHostName = (url) => {
    let hostname;
    //find & remove protocol (http, ftp, etc.) and get hostname

    if (url.indexOf("//") > -1) {
        hostname = url.split('/')[2];
    }
    else {
        hostname = url.split('/')[0];
    }

    //find & remove port number
    hostname = hostname.split(':')[0];
    //find & remove "?"
    hostname = hostname.split('?')[0];

    return hostname;
};

const fetchData = (url, method, fetchedData) => {
    if (method == 'post') {
        fetch(url, {
            method: method,
            body: fetchedData
        }).then(function(response) {
            console.log(response);
        }).then(function(data) {
            console.log(data);
        });
    }
    if (method == 'get') {
        fetch(url, {
            method: method,
        }).then(function(response) {
            console.log(response);
        }).then(function(data) {
            console.log(data);
        });
    }
};
export {shuffleArray, convertToAE, extractHostName, fetchData};