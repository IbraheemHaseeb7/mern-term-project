function getTimeValue(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    let timePassed;
    if (diffInSeconds < 60) {
        timePassed = `${diffInSeconds} seconds`;
    } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        timePassed = `${minutes} minutes`;
    } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        timePassed = `${hours} hours`;
    } else {
        const days = Math.floor(diffInSeconds / 86400);
        timePassed = `${days} days`;
    }

    return timePassed;
}
