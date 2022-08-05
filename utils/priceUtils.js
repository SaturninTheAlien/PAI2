'use strict';

function formatPLN(price){
    let negative = price < 0;
    let res="";

    if(negative){
        res="-";
        price = -price;
    }
    let price_str = price.toString();
    if(price_str.length > 2){
        res += price_str.slice(0, price_str.length-2)+","+price_str.slice(price_str.length-2);
    }
    else{
        res += "0,";
        if(price_str.length < 2)res += "0";
        res += price_str;
    }

    res+=" zł";
    return res;
}

module.exports = {
    formatPLN
}