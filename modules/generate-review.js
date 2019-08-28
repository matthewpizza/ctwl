"use strict";

const Markov = require("markov-strings").default;
const getTsv = require("./get-tsv");
const reviews = getTsv(`${__dirname}/../data/reviews.tsv`);

reviews.shift();

const names = reviews.map(review => review[0]);
const content = reviews.map(review => review[3]);
let firstName = names[Math.floor(Math.random() * names.length)].split(" ")[0];
let lastInitial = names[Math.floor(Math.random() * names.length)].split(" ")[1];

const markov = new Markov(content, { stateSize: 3 });
markov.buildCorpus();

const minScore = 20;
let foundScore = 0;

while (foundScore < minScore) {
    let result = markov.generate({});
    foundScore = result.score;
    if (foundScore > minScore) {
        console.log(result.string)
        console.log(`— ${firstName} ${lastInitial}`)
    }
}
