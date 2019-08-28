"use strict";

const { readFileSync } = require("fs")
const { resolve } = require("path");

module.exports = filePath => {
    const file = readFileSync(resolve(filePath), "utf8");
    return file.split("\n")
        .filter(line => line)
        .map(line => line.split("\t"));
};