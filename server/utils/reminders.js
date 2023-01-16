function createReminder(inputDate) {
    let alarm1 = new Date() * 1 + ((new Date(inputDate) - new Date() * 1) * 0.25)
    let alarm2 = new Date() * 1 + ((new Date(inputDate) - new Date() * 1) * 0.50)
    let alarm3 = new Date(inputDate) - (1000 * 60 * 10);
    let reminders = [new Date(alarm1), new Date(alarm2), new Date(alarm3)];
    return reminders
}
export default createReminder;

// createReminder("Fri Sep 23 2022 21:06:01 GMT+0530 (India Standard Time)")

