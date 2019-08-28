"use strict";

//
// https://colortheworldlipsticks.com/pages/reviews
//

const fetch = require("node-fetch");
const { JSDOM } = require("jsdom");
const { writeFileSync } = require("fs");
const { resolve } = require("path");
const columns = [ "name", "stars", "title", "content" ];
const reviewsFile = resolve(`${__dirname}/../data/reviews.tsv`);

const getReviewsForPage = page => {
    return new Promise((resolve, reject) => {
        fetch("https://staticw2.yotpo.com/batch", {"credentials":"omit","headers":{"accept":"application/json","content-type":"application/x-www-form-urlencoded","sec-fetch-mode":"cors"},"referrer":"https://colortheworldlipsticks.com/pages/reviews","referrerPolicy":"no-referrer-when-downgrade","body":"methods=%5B%7B%22method%22%3A%22reviews%22%2C%22params%22%3A%7B%22page%22%3A"+page+"%2C%22host-widget%22%3A%22testimonials%22%2C%22is_mobile%22%3Afalse%2C%22pictures_per_review%22%3A10%2C%22reference%22%3A%22testimonials_widget_internal%22%2C%22hide_custom_fields%22%3Atrue%2C%22per_page%22%3A10%2C%22type%22%3A%22testimonials_custom_tab%22%7D%7D%5D&app_key=t1ZL8WnmfP1uam3VHJDgvon4jMhM1ehZo4FBQJVi&is_mobile=false&widget_version=2018-12-11_10-16-29","method":"POST","mode":"cors"})
            .then(res => {
                if (res.status !== 200) {
                    reject(res.status);
                }
                return res.text();
            })
            .then(body => JSON.parse(body))
            .then(json => new JSDOM(json[0].result))
            .then(dom => dom.window.document.querySelectorAll(".yotpo-review"))
            .then(reviews => {
                return [...reviews].map(review => {
                    let name = review.querySelector(".yotpo-user-name");
                    name = name ? name.textContent : "";
                    name = name.trim();

                    let stars = review.querySelector(".yotpo-review-stars .sr-only");
                    stars = stars ? stars.textContent : "";
                    stars = stars.replace("star rating").trim();

                    let title = review.querySelector(".content-title");
                    title = title ? title.textContent : "";
                    title = title.trim();

                    let content = review.querySelector(".content-review");
                    content = content ? content.textContent : "";
                    content = content.trim();

                    return [
                        name,
                        parseInt(stars, 10),
                        title,
                        content,
                    ];
                })
            })
            .then(formatted => resolve(formatted))
    });
};

let reviews = [];

const getTsv = reviews => {
    let butts = reviews.slice();
    butts.unshift(columns);
    let tsv = butts.map(review => review.join("\t"));

    return tsv.join("\n");
};

const loop = page => {
    return getReviewsForPage(page).then(result => {
        console.log(`page: ${page}`)
        reviews = [...reviews, ...result];
        writeFileSync(reviewsFile, getTsv(reviews));
        if (result.length) {
            return loop(page + 1)
        }
    })
};

loop(1).then(() => {
    writeFileSync(reviewsFile, getTsv(reviews));
});
