function charGen(fixAsciiNum, tillnum) {
    return String.fromCharCode(fixAsciiNum + Math.floor(tillnum * Math.random()));
}

function randomToken(till) {
    let password = '';
    for (let i = 0; i < till; i++) {
        password += 0.5 < Math.random() ? charGen(65,26) : 0.5 < Math.random() ? charGen(97,26) : charGen(48,10);
    }
    return password.split('').sort(() => 0.5 - Math.random()).join('');
}

export default randomToken;