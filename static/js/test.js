// Original string
let str = '{{3," "," ",4," "," "," "," "," "},{" ",2,3,9," "," "," ",1,6},{" ",9," ",8,6,4," "," "," "},{3," "," "," "," "," "," "," "," "},{8," ",7,1,2," "," "," "," "},{" ",4," "," "," "," "," ",6,8},{" "," ",8,2,6,1," "," "," "},{9," "," ",2," ",3," "," ",7},{" ",7," "," "," ",4,8," ",1}}';

str = str.replace(/{/g, "[")
str = str.replace(/}/g, "]")
str = str.replace(/'/, '"');


// Convert the string into a JavaScript array
console.log(typeof(str))
console.log(str)
let array = JSON.parse(str);


console.log(array);
console.log(typeof(array))

