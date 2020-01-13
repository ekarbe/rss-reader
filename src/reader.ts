import * as hm from 'typed-rest-client/HttpClient';
import * as parser from 'fast-xml-parser';
import * as he from 'he';
import * as ht from 'html-to-text';
import { IFeed, IEntry, IFeedConfig } from './interface';

const http: hm.HttpClient = new hm.HttpClient('XML');

/**
 * Requests and parses the XML feed
 * 
 * @param config 
 */
export async function XML(config: IFeedConfig): Promise<IFeed> {
    return new Promise<any>((resolve, reject) => {
        http.get(config.url)
            .then(res => {
                res.readBody()
                    .then(body => {
                        parseXML(body, config)
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
function parseXML(XML: string, config: IFeedConfig): Promise<IFeed> {
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
        } else if (JSON["rdf:RDF"]) {
            feed = JSON["rdf:RDF"];
        }
        if (feed) {
            let items = undefined;
            if (feed.item) {
                items = feed.item;
            } else if (feed.entry) {
                items = feed.entry;
            }
            if (items) {
                items.forEach((object: any) => {
                    let entry: IEntry = {
                        identifier: config.identifier,
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
                    if (object.content) {
                        if (object.content.text) {
                            entry.content = ht.fromString(he.decode(object.content.text));
                        } else {
                            entry.content = ht.fromString(he.decode(object.content));
                        }
                    } else if (object["content:encoded"]) {
                        entry.content = ht.fromString(he.decode(object["content:encoded"]));
                    } else if (object.description && typeof (object.description) !== "object") {
                        entry.content = ht.fromString(he.decode(object.description));
                    } else if (object.description.text) {
                        entry.content = ht.fromString(he.decode(object.description.text));
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