const str = '* -> asa nhi dikna chaiye';
const regex = /^([\*\-\+]|\d+\.)(\s*->)?\s*/;
console.log("Original: ", str);
console.log("Replaced: ", str.replace(regex, ''));

const str2 = '* item 1';
console.log("Original: ", str2);
console.log("Replaced: ", str2.replace(regex, ''));
