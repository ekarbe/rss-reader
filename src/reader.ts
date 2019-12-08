import * as hm from 'typed-rest-client/HttpClient';
import * as parser from 'fast-xml-parser';
import * as he from 'he';
import { IFeed, IEntry } from './interface';

const http: hm.HttpClient = new hm.HttpClient('XML');

/**
 * Requests and parses the XML feed
 * 
 * @param URL 
 */
export async function XML(URL: string): Promise<IFeed> {
    return new Promise<any>((resolve, reject) => {
        http.get(URL)
            .then(res => {
                res.readBody()
                    .then(body => {
                        parseXML(body)
                            .then(response => {
                                resolve(response);
                            })
                            .catch(error => {
                                reject(error);
                            });
                    })
                    .catch(error => {
                        reject(error);
                    });
            })
            .catch(error => {
                reject(error);
            });
    });
}

/**
 * Parses all kinds of feeds to return a uniform object
 * 
 * @param XML 
 */
function parseXML(XML: string): Promise<IFeed> {
    return new Promise<any>((resolve, reject) => {
        let JSON = parser.parse(XML, {
            attributeNamePrefix: "",
            attrNodeName: "attr",
            textNodeName: "text",
            ignoreAttributes: false,
            parseAttributeValue: true
        });
        let feed = undefined;
        let feedObject: IFeed = {
            entries: []
        };
        if (JSON.rss) {
            if (JSON.rss.channel) {
                feed = JSON.rss.channel;
            } else if (JSON.rss.feed) {
                feed = JSON.rss.feed;
            }
        } else if (JSON.channel) {
            feed = JSON.channel;
        } else if (JSON.feed) {
            feed = JSON.feed;
        }
        if (feed) {
            if (feed.title && typeof (feed.title) !== "object") {
                feedObject.title = feed.title;
            } else if (feed.title.text) {
                feedObject.title = feed.title.text;
            }
            let items = undefined;
            if (feed.item) {
                items = feed.item;
            } else if (feed.entry) {
                items = feed.entry;
            }
            if (items) {
                items.forEach((object: any) => {
                    let entry: IEntry = {
                        title: ""
                    };
                    if (object.title && typeof (object.title) !== "object") {
                        entry.title = object.title;
                    }
                    else if (object.title.text) {
                        entry.title = object.title.text;
                    }
                    if (entry.title) {
                        entry.title = he.decode(entry.title);
                    }
                    if (object.updated) {
                        entry.date = object.updated;
                    } else if (object.pubDate) {
                        entry.date = object.pubDate;
                    }
                    if (object.link && typeof (object.link) !== "object") {
                        entry.link = object.link;
                    } else if (object.link.attr) {
                        entry.link = object.link.attr.href;
                    } else if (object.source) {
                        entry.link = object.source;
                    }
                    if (entry && feedObject.entries) {
                        feedObject.entries.push(entry);
                    }
                });
                resolve(feedObject);
            } else {
                reject("Error: No items!");
            }
        } else {
            reject("Error: No feed!");
        }
    });
}