const ResearchDAO = require("../data/research-dao").ResearchDAO;
const needle = require("needle");
const {
    environmentalScripts
} = require("../../config/config");

const ALLOWED_RESEARCH_HOST = "query1.finance.yahoo.com";

function ResearchHandler(db) {
    "use strict";

    const researchDAO = new ResearchDAO(db);

    this.displayResearch = (req, res) => {

        if (req.query.symbol) {
            // Remediation: CWE-918 — SSRF
            // url vinha de req.query.url (controlado pelo usuario) e permitia
            // o servidor buscar qualquer destino interno/externo.
            const symbol = String(req.query.symbol || "").replace(/[^A-Za-z0-9.]/g, "");
            const url = `https://${ALLOWED_RESEARCH_HOST}/v8/finance/chart/${encodeURIComponent(symbol)}`;
            return needle.get(url, (error, newResponse, body) => {
                if (!error && newResponse.statusCode === 200) {
                    res.writeHead(200, {
                        "Content-Type": "text/html"
                    });
                }
                res.write("<h1>The following is the stock information you requested.</h1>\n\n");
                res.write("\n\n");
                if (body) {
                    res.write(body);
                }
                return res.end();
            });
        }

        return res.render("research", {
            environmentalScripts
        });
    };

}

module.exports = ResearchHandler;
