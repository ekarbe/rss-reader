export interface IFeed {
    title?: string;
    entries?: Array<IEntry>;
}

export interface IEntry {
    identifier?: string;
    title: string;
    link?: string;
    date?: Date;
    content?: string;
}

export interface IFeedConfig {
    identifier?: string;
	title: string;
	url: string;
	id?: number;
}