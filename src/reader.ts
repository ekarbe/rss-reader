import * as hm from 'typed-rest-client/HttpClient';

const http: hm.HttpClient = new hm.HttpClient('XML');

export interface IFeed {
    title: string;
    entries: Array<IEntry>;
}

export interface IEntry {
    title: string;
    link: string;
    summary: string;
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

function parseXML(XML: string): IFeed {
    if (XML.match(/\<feed xmlns=\"http:\/\/www\.w3\.org\/2005\/Atom\"/g)) {
        let items = XML.split('<entry>');
        let feed: IFeed = {
            title: "",
            entries: [],
        };
        let titleArr = items[0].split('</title>');
        let re: RegExp = RegExp("<title.*>(.*)", "gm");
        let title = re.exec(titleArr[0]);
        if (title) {
            feed.title = title[1];
        }
        items.splice(0, 1);
        items.forEach(element => {
            let entry: IEntry = {
                title: "",
                link: "",
                summary: "",
            };
            re = RegExp("<title.*>(.*)(?=<\/title>)", "gm");
            title = re.exec(element);
            if (title) {
                if (/<!\[CDATA\[(.*)(?=\]\]>)/gm.test(title[1])) {
                    title = /<!\[CDATA\[(.*)(?=\]\]>)/gm.exec(title[1]);
                }
                if (title) {
                    entry.title = title[1];
                }
            }
            re = RegExp('<link href="(.*)(?="\/>)', "gm");
            let link = re.exec(element);
            if (link) {
                entry.link = link[1];
            }
            re = RegExp("<summary.*>(.*)(?=<\/summary>)", "gm");
            let summary = re.exec(element);
            if (summary) {
                if (/<!\[CDATA\[(.*)(?=\]\]>)/gm.test(summary[1])) {
                    summary = /<!\[CDATA\[(.*)(?=\]\]>)/gm.exec(summary[1]);
                }
                if (summary) {
                    entry.summary = summary[1];
                }
            }
            feed.entries.push(entry);
        });
        return feed;
    } else if (XML.match(/<rss version="2\.0"/g)) {
        let items = XML.split('<item>');
        let feed: IFeed = {
            title: "",
            entries: [],
        };
        let titleArr = items[0].split('</title>');
        let re: RegExp = RegExp("<title>(.*)", "gm");
        let title = re.exec(titleArr[0]);
        if (title) {
            feed.title = title[1];
        }
        items.splice(0, 1);
        items.forEach(element => {
            let entry: IEntry = {
                title: "",
                link: "",
                summary: "",
            };
            re = RegExp("<title>(.*)(?=<\/title>)", "gm");
            console.log(element);
            title = re.exec(element);
            if (title) {
                if (/<!\[CDATA\[(.*)(?=\]\]>)/gm.test(title[1])) {
                    title = /<!\[CDATA\[(.*)(?=\]\]>)/gm.exec(title[1]);
                }
                if (title) {
                    entry.title = title[1];
                }
            }
            re = RegExp("<link>(.*)(?=<\/link>)", "gm");
            let link = re.exec(element);
            if (link) {
                entry.link = link[1];
            }
            re = RegExp("<description>(.*)(?=<\/description>)", "gm");
            let summary = re.exec(element);
            if (summary) {
                if (/<!\[CDATA\[(.*)(?=\]\]>)/gm.test(summary[1])) {
                    summary = /<!\[CDATA\[(.*)(?=\]\]>)/gm.exec(summary[1]);
                }
                if (summary) {
                    entry.summary = summary[1];
                }
            }
            feed.entries.push(entry);
        });
        return feed;
    } else {
        let items = XML.split('<item>');
        let feed: IFeed = {
            title: "",
            entries: [],
        };
        let titleArr = items[0].split('</title>');
        let re: RegExp = RegExp("<title>(.*)", "gm");
        let title = re.exec(titleArr[0]);
        if (title) {
            feed.title = title[1];
        }
        items.splice(0, 1);
        items.forEach(element => {
            let entry: IEntry = {
                title: "",
                link: "",
                summary: "",
            };
            re = RegExp("<title>(.*)(?=<\/title>)", "gm");
            title = re.exec(element);
            if (title) {
                if (/<!\[CDATA\[(.*)(?=\]\]>)/gm.test(title[1])) {
                    title = /<!\[CDATA\[(.*)(?=\]\]>)/gm.exec(title[1]);
                }
                if (title) {
                    entry.title = title[1];
                }
            }
            re = RegExp('<link>(.*)(?=<\/link>)', "gm");
            let link = re.exec(element);
            if (link) {
                entry.link = link[1];
            }
            if (!entry.link) {
                re = RegExp('<source url="(.*)(?=">)', "gm");
                let link = re.exec(element);
                if (link) {
                    entry.link = link[1];
                }
            }
            re = RegExp("<description>(.*)(?=<\/description>)", "gm");
            let summary = re.exec(element);
            if (summary) {
                if (/<!\[CDATA\[(.*)(?=\]\]>)/gm.test(summary[1])) {
                    summary = /<!\[CDATA\[(.*)(?=\]\]>)/gm.exec(summary[1]);
                }
                if (summary) {
                    entry.summary = summary[1];
                }
            }
            feed.entries.push(entry);
        });
        return feed;
    }
}