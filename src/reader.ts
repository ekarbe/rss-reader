import * as hm from 'typed-rest-client/HttpClient';
import * as parser from 'fast-xml-parser';

const http: hm.HttpClient = new hm.HttpClient('XML');

export interface IFeed {
    title?: string;
    entries?: Array<IEntry>;
}

export interface IEntry {
    title: string;
    link?: string;
    date?: Date;
}

export async function XML(URL: string): Promise<IFeed> {
    return new Promise<any>((resolve, reject) => {
        http.get(URL)
            .then(res => {
                res.readBody()
                    .then(body => {
                        let feed = parseXML(body);
                        resolve(feed);
                    });
            });
    });
}

//USE DOMPARSER U DUMBASS

function parseXML(XML: string): IFeed | undefined {
    let JSON = parser.parse(XML);
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
        if (feed.title) {
            feedObject.title = feed.title;
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
                if(object.title){
                    entry.title = object.title;
                }
                if(object.updated){
                    entry.date = object.updated;
                } else if(object.pubDate) {
                    entry.date = object.pubDate;
                }
                if(object.link){
                    entry.link = object.link;
                } else if(object.source){
                    entry.link = object.source;
                } // else regex for link other content
                if (entry && feedObject.entries) {
                    feedObject.entries.push(entry);
                }
            });
            return feedObject;
        } else {
            // not items error
        }
    } else {
        // no feed error
    }
}