function dateToGMT(date) {
    let dateInNumber = new Date(date + ':00.000Z').getTime() * 1;
    let localBufferTime = new Date().toString().split("GMT")[1].split(' ')[0]
    let toAdd = (localBufferTime.slice(1,3) * (60 * 60 * 1000)) + (localBufferTime.slice(3,5) * (60 *1000))
    localBufferTime[0] === "+" ? dateInNumber = dateInNumber - toAdd :  dateInNumber = dateInNumber + toAdd;
    return dateInNumber;
}
export default dateToGMT;
