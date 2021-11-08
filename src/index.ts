import { readFile } from "fs/promises";
import http from "http";
import https from "https";

import * as Topgg from "@top-gg/sdk";
import express from "express";
import fetch from "node-fetch";

(async () => {
  try {
    const app = express();
    const topgg = new Topgg.Webhook(process.env.TOPGG_TOKEN);

    app.post(
      "/votes",
      topgg.listener(async (payload) => {
        const message = `Thank you for providing offerings <@!${payload.user}>. You have now been granted additional permissions in the server within 12 hours and a special role that hoists you above all other level ranks! 🔥 Would you like to stop receiving these notifications? Head over to <#868554059974574180>, type and enter \`?unsubscribe\`.`;
        const reminder = `Hello <@!${payload.user}>, it is time for you to vote on Top.GG and provide offerings for the hearth. Vote for the server at: <https://top.gg/servers/431481677445988362/vote>`;

        await fetch(process.env.WH_URL as string, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: message,
            // eslint-disable-next-line camelcase
            allowed_mentions: {
              parse: [],
            },
          }),
        });

        setTimeout(async () => {
          await fetch(process.env.WH_URL as string, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              content: reminder,
            }),
          });
          // 12 hours
        }, 1000 * 60 * 60 * 12);
      })
    );

    const httpServer = http.createServer(app);
    httpServer.listen(4080, () => {
      console.log("http server is live on port 4080!");
    });

    if (process.env.NODE_ENV === "production") {
      const privateKey = await readFile(
        "/etc/letsencrypt/live/gaea.nhcarrigan.com/privkey.pem",
        "utf-8"
      );
      const certificate = await readFile(
        "/etc/letsencrypt/live/gaea.nhcarrigan.com/cert.pem",
        "utf-8"
      );
      const ca = await readFile(
        "/etc/letsencrypt/live/gaea.nhcarrigan.com/chain.pem",
        "utf-8"
      );

      const credentials = {
        key: privateKey,
        cert: certificate,
        ca: ca,
      };

      const httpsServer = https.createServer(credentials, app);
      httpsServer.listen(4443, () => {
        console.log("https server is live on port 4443!");
      });
    }
  } catch (err) {
    console.error(err);
  }
})();
