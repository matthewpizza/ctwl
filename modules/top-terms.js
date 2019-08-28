"use strict";

const { writeFileSync } = require("fs");
const { resolve } = require("path");
const getTsv = require("./get-tsv");
const terms = resolve(`${__dirname}/../data/terms.tsv`);
const overall = resolve(`${__dirname}/../data/overall.tsv`);
const ignored = require("../data/ignored");
const reviews = getTsv(`${__dirname}/../data/reviews.tsv`);
const keys = ["word", "usage"];
reviews.shift();
const content = reviews.map(review => review[3]);
const top = new Map();
let words = [];

content.forEach(review => {
    let result = review
        .replace(/[.,\/#!$%\^&\*;:{}=\-+'"?@…#_`~()“”‘’]/g, " ")
        .split(" ")
        .map(word => word.trim().toLowerCase())
        .filter(word => {
            return word &&
                word.length > 2 &&
                -1 === ignored.indexOf(word);
        });
    words = [...words, ...result];
})

words.forEach(word => {
    let value = top.get(word);
    value = value ? ++value : 1
    top.set(word, value);
});

let sorted = Array.from(top).sort((a, b) => b[1] - a[1]);
sorted.unshift(keys);

let termsTsv = sorted.map(row => row.join("\t")).join("\n");
writeFileSync(terms, termsTsv);

const overallGuts = [
    [ "reviews", "important words" ],
    [ reviews.length, words.length ],
];
let overallTsv = overallGuts.map(gut => gut.join("\t")).join("\n");
writeFileSync(overall, overallTsv);
