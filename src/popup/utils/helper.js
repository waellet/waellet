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

const detectBrowser = () => {
    if((navigator.userAgent.indexOf("Opera") || navigator.userAgent.indexOf('OPR')) != -1 ) {
        return 'Opera'
    }else if(navigator.userAgent.indexOf("Chrome") != -1 ){
        return 'Chrome'
    }else if(navigator.userAgent.indexOf("Safari") != -1){
        return 'Safari'
    }else if(navigator.userAgent.indexOf("Firefox") != -1 ) {
        return 'Firefox'
    }else if((navigator.userAgent.indexOf("MSIE") != -1 ) || (!!document.documentMode == true )){
        return 'IE'
    }else {
       return 'unknown'
    }
}

export {shuffleArray, convertToAE, extractHostName, detectBrowser };